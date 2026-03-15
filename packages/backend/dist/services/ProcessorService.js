"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessorService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const date_fns_1 = require("date-fns");
class ProcessorService {
    config;
    state;
    log;
    maintainerr;
    plex;
    overlay;
    status = 'idle';
    lastRun = null;
    lastResult = null;
    constructor(config, state, log, maintainerr, plex, overlay) {
        this.config = config;
        this.state = state;
        this.log = log;
        this.maintainerr = maintainerr;
        this.plex = plex;
        this.overlay = overlay;
    }
    // ── Date helpers ──────────────────────────────────────────────────────────
    getDeleteDate(addDate, deleteAfterDays) {
        if (!deleteAfterDays)
            return null;
        const d = new Date(addDate);
        d.setDate(d.getDate() + deleteAfterDays);
        return d;
    }
    getDaysLeft(deleteDate) {
        const now = new Date();
        const diff = deleteDate.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    ordinalSuffix(n) {
        const abs = Math.abs(n);
        const lastTwo = abs % 100;
        if (lastTwo >= 11 && lastTwo <= 13)
            return `${n}th`;
        switch (abs % 10) {
            case 1: return `${n}st`;
            case 2: return `${n}nd`;
            case 3: return `${n}rd`;
            default: return `${n}th`;
        }
    }
    formatDateLabel(deleteDate, cfg) {
        const overlayText = cfg.overlayText;
        let label;
        if (overlayText.useDays) {
            const days = this.getDaysLeft(deleteDate);
            if (days === 0) {
                label = overlayText.textToday;
            }
            else if (days === 1) {
                label = overlayText.textDay;
            }
            else {
                label = overlayText.textDays.replace('{0}', String(days));
            }
        }
        else {
            // Format as date
            try {
                label = `${overlayText.overlayText} ${(0, date_fns_1.format)(deleteDate, this.convertDateFormat(overlayText.dateFormat))}`;
                if (overlayText.enableDaySuffix && overlayText.language.startsWith('en')) {
                    const day = deleteDate.getDate();
                    const suffix = this.ordinalSuffix(day);
                    // Replace the day number with the ordinal
                    label = label.replace(new RegExp(`\\b${day}\\b`), suffix);
                }
            }
            catch {
                label = `${overlayText.overlayText} ${deleteDate.toLocaleDateString()}`;
            }
        }
        if (overlayText.enableUppercase)
            label = label.toUpperCase();
        return label;
    }
    // Converts e.g. "MMM d" (PowerShell/C# format) to date-fns format tokens
    convertDateFormat(fmt) {
        return fmt
            .replace(/MMMM/g, 'MMMM') // full month — same
            .replace(/MMM/g, 'MMM') // short month — same
            .replace(/MM/g, 'MM') // zero-padded month — same
            .replace(/\bM\b/g, 'M') // month number — same
            .replace(/dddd/g, 'EEEE') // full weekday
            .replace(/ddd/g, 'EEE') // short weekday
            .replace(/\bdd\b/g, 'dd') // zero-padded day — same
            .replace(/\bd\b/g, 'd') // day — same
            .replace(/yyyy/g, 'yyyy') // 4-digit year — same
            .replace(/\byy\b/g, 'yy'); // 2-digit year — same
    }
    // ── Poster helpers ────────────────────────────────────────────────────────
    getOriginalPosterPath(dataDir, plexId) {
        return path.join(dataDir, 'originals', `${plexId}.jpg`);
    }
    async saveOriginalPoster(dataDir, plexId, buffer) {
        const dir = path.join(dataDir, 'originals');
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.getOriginalPosterPath(dataDir, plexId), buffer);
    }
    loadOriginalPoster(dataDir, plexId) {
        const p = this.getOriginalPosterPath(dataDir, plexId);
        if (fs.existsSync(p))
            return fs.readFileSync(p);
        return null;
    }
    deleteOriginalPoster(dataDir, plexId) {
        const p = this.getOriginalPosterPath(dataDir, plexId);
        if (fs.existsSync(p))
            fs.unlinkSync(p);
    }
    // ── Revert ────────────────────────────────────────────────────────────────
    async revertItem(plexId, itemState, cfg) {
        const plexIdStr = String(plexId);
        this.log.info(`Reverting overlay for Plex item ${plexIdStr}…`);
        // 1. Remove old uploaded overlay poster from Plex
        if (itemState.uploadedPosterId) {
            await this.plex.deleteUploadedPoster(plexIdStr, itemState.uploadedPosterId);
        }
        // 2. Re-upload original poster
        const originalBuf = this.loadOriginalPoster(cfg.dataDir, plexIdStr);
        if (originalBuf) {
            try {
                // Save any leftover uploaded posters to clean up
                const postersBefore = await this.plex.getPosters(plexIdStr);
                const idsBefore = this.plex.getUploadPosterIds(postersBefore);
                await this.plex.uploadPoster(plexIdStr, originalBuf, 'image/jpeg');
                const postersAfter = await this.plex.getPosters(plexIdStr);
                const idsAfter = this.plex.getUploadPosterIds(postersAfter);
                const newId = idsAfter.find((id) => !idsBefore.includes(id));
                if (newId) {
                    await this.plex.selectPoster(plexIdStr, newId);
                    this.log.success(`Restored original poster for item ${plexIdStr}`);
                }
            }
            catch (err) {
                this.log.error(`Failed to restore original for ${plexIdStr}: ${err}`);
            }
        }
        else {
            this.log.warn(`No saved original poster for ${plexIdStr}, cannot restore.`);
        }
        this.deleteOriginalPoster(cfg.dataDir, plexIdStr);
    }
    // ── Apply overlay ──────────────────────────────────────────────────────────
    async applyOverlay(plexId, label, deleteDate, existingState, cfg) {
        const plexIdStr = String(plexId);
        // 1. Get best poster URL
        const thumbPath = await this.plex.getBestPosterUrl(plexIdStr);
        if (!thumbPath) {
            this.log.warn(`Could not find poster URL for item ${plexIdStr}, skipping.`);
            return null;
        }
        // 2. Download poster
        let posterBuf;
        try {
            posterBuf = await this.plex.downloadPoster(thumbPath);
        }
        catch (err) {
            this.log.error(`Failed to download poster for ${plexIdStr}: ${err}`);
            return null;
        }
        // 3. Save original if not already saved
        if (!existingState?.processed) {
            await this.saveOriginalPoster(cfg.dataDir, plexIdStr, posterBuf);
            this.log.debug(`Saved original poster for ${plexIdStr}`);
        }
        // 4. Render overlay
        const overlayOpts = {
            text: label,
            fontPath: cfg.overlayStyle.fontPath,
            fontColor: cfg.overlayStyle.fontColor,
            backColor: cfg.overlayStyle.backColor,
            fontSize: cfg.overlayStyle.fontSize,
            padding: cfg.overlayStyle.padding,
            backRadius: cfg.overlayStyle.backRadius,
            horizontalOffset: cfg.overlayStyle.horizontalOffset,
            horizontalAlign: cfg.overlayStyle.horizontalAlign,
            verticalOffset: cfg.overlayStyle.verticalOffset,
            verticalAlign: cfg.overlayStyle.verticalAlign,
            overlayBottomCenter: cfg.overlayStyle.overlayBottomCenter,
            useFrame: cfg.frame.useFrame,
            frameColor: cfg.frame.frameColor,
            frameWidth: cfg.frame.frameWidth,
            frameRadius: cfg.frame.frameRadius,
            frameInnerRadius: cfg.frame.frameInnerRadius,
            frameInnerRadiusMode: cfg.frame.frameInnerRadiusMode,
            frameInset: cfg.frame.frameInset,
            dockStyle: cfg.frame.dockStyle,
            dockPosition: cfg.frame.dockPosition,
        };
        let overlayResult;
        try {
            overlayResult = await this.overlay.renderOverlay(posterBuf, overlayOpts);
        }
        catch (err) {
            this.log.error(`Overlay rendering failed for ${plexIdStr}: ${err}`);
            return null;
        }
        // 5. Upload and select overlay poster
        try {
            const postersBefore = await this.plex.getPosters(plexIdStr);
            const idsBefore = this.plex.getUploadPosterIds(postersBefore);
            // Remove previous overlay upload if it exists
            if (existingState?.uploadedPosterId) {
                await this.plex.deleteUploadedPoster(plexIdStr, existingState.uploadedPosterId);
            }
            await this.plex.uploadPoster(plexIdStr, overlayResult.buffer, overlayResult.contentType);
            const postersAfter = await this.plex.getPosters(plexIdStr);
            const idsAfter = this.plex.getUploadPosterIds(postersAfter);
            const newId = idsAfter.find((id) => !idsBefore.includes(id));
            if (!newId) {
                this.log.warn(`Could not determine new upload poster ID for ${plexIdStr}`);
                return null;
            }
            const selected = await this.plex.selectPoster(plexIdStr, newId);
            if (!selected) {
                this.log.warn(`Failed to select uploaded poster for ${plexIdStr}`);
            }
            this.log.success(`Applied overlay to item ${plexIdStr} (id=${newId})`);
            return {
                processed: true,
                deleteDate: deleteDate.toISOString(),
                uploadedPosterId: newId,
                daysLeftShown: cfg.overlayText.useDays ? this.getDaysLeft(deleteDate) : null,
            };
        }
        catch (err) {
            this.log.error(`Failed to upload/select poster for ${plexIdStr}: ${err}`);
            return null;
        }
    }
    // ── Collection ordering ────────────────────────────────────────────────────
    async reorderCollection(collection, collectionPlexId, sortedPlexIds, cfg) {
        if (sortedPlexIds.length < 2)
            return;
        try {
            await this.plex.setCollectionCustomSort(collectionPlexId);
            for (let i = 1; i < sortedPlexIds.length; i++) {
                await this.plex.moveCollectionItem(collectionPlexId, sortedPlexIds[i], sortedPlexIds[i - 1]);
            }
            this.log.info(`Reordered collection "${collection.title}"`);
        }
        catch (err) {
            this.log.warn(`Failed to reorder collection "${collection.title}": ${err}`);
        }
    }
    // ── Janitor ───────────────────────────────────────────────────────────────
    async janitorCleanup(currentPlexIds, currentState, cfg) {
        const cleaned = { ...currentState };
        for (const plexId of Object.keys(cleaned)) {
            if (!currentPlexIds.has(plexId)) {
                const exists = await this.plex.itemExists(plexId);
                if (!exists) {
                    this.log.info(`Janitor: item ${plexId} no longer exists in Plex, cleaning up.`);
                    this.deleteOriginalPoster(cfg.dataDir, plexId);
                    delete cleaned[plexId];
                }
            }
        }
        return cleaned;
    }
    // ── Reset all overlays ────────────────────────────────────────────────────
    async resetAllOverlays() {
        this.log.warn('Resetting all overlays…');
        const cfg = this.config.get();
        const currentState = this.state.load();
        for (const [plexId, itemState] of Object.entries(currentState)) {
            if (itemState.processed) {
                await this.revertItem(plexId, itemState, cfg);
            }
        }
        this.state.clear();
        this.log.success('All overlays reset and state cleared.');
    }
    // ── Main run loop ─────────────────────────────────────────────────────────
    async run() {
        if (this.status === 'running') {
            this.log.warn('Processor is already running, skipping this trigger.');
            return { processed: 0, reverted: 0, skipped: 0, errors: 0 };
        }
        this.status = 'running';
        const result = { processed: 0, reverted: 0, skipped: 0, errors: 0 };
        try {
            const cfg = this.config.get();
            if (!cfg.plex.url || !cfg.plex.token) {
                this.log.error('Plex URL or token not configured. Aborting run.');
                this.status = 'error';
                return result;
            }
            if (!cfg.maintainerr.url) {
                this.log.error('Maintainerr URL not configured. Aborting run.');
                this.status = 'error';
                return result;
            }
            // Sync service connection details
            this.plex.updateConnection(cfg.plex.url, cfg.plex.token);
            this.maintainerr.updateBaseUrl(cfg.maintainerr.url);
            this.log.info('=== Maintainerr Overlay Processor started ===');
            // 1. Fetch all collections
            let collections;
            try {
                collections = await this.maintainerr.getCollections();
            }
            catch (err) {
                this.log.error(`Could not fetch collections from Maintainerr: ${err}`);
                this.status = 'error';
                return result;
            }
            if (collections.length === 0) {
                this.log.info('No collections found in Maintainerr.');
                this.status = 'idle';
                return result;
            }
            // 2. Filter by processCollections setting
            const filterList = cfg.processing.processCollections;
            const processAll = filterList.length === 0 || filterList.includes('*');
            const filteredCollections = processAll
                ? collections
                : collections.filter((c) => filterList.some((name) => name.toLowerCase() === c.title.toLowerCase()));
            this.log.info(`Processing ${filteredCollections.length} collection(s) out of ${collections.length} total.`);
            // 3. Load state
            let currentState = this.state.load();
            // 4. Build set of all current mediaServerIds across all filtered collections
            const allCurrentPlexIds = new Set();
            for (const coll of filteredCollections) {
                for (const item of coll.media) {
                    allCurrentPlexIds.add(item.mediaServerId);
                }
            }
            // 5. Revert items that are in state but no longer in any collection
            for (const [plexId, itemState] of Object.entries(currentState)) {
                if (!allCurrentPlexIds.has(plexId) && itemState.processed) {
                    this.log.info(`Item ${plexId} no longer in any Maintainerr collection, reverting poster…`);
                    await this.revertItem(plexId, itemState, cfg);
                    delete currentState[plexId];
                    result.reverted++;
                }
            }
            // 6. Process each collection
            for (const coll of filteredCollections) {
                if (!coll.deleteAfterDays) {
                    this.log.debug(`Collection "${coll.title}" has no deleteAfterDays set, skipping.`);
                    continue;
                }
                this.log.info(`--- Processing collection: "${coll.title}" (${coll.media.length} items) ---`);
                const itemsWithDates = [];
                for (const mediaItem of coll.media) {
                    const plexId = mediaItem.mediaServerId;
                    const deleteDate = this.getDeleteDate(mediaItem.addDate, coll.deleteAfterDays);
                    if (!deleteDate)
                        continue;
                    const label = this.formatDateLabel(deleteDate, cfg);
                    const existingState = currentState[plexId] ?? null;
                    // Decide whether to apply/re-apply
                    const daysLeft = this.getDaysLeft(deleteDate);
                    const deleteDateIso = deleteDate.toISOString();
                    const shouldApply = !existingState?.processed ||
                        cfg.processing.reapplyOverlay ||
                        existingState.deleteDate !== deleteDateIso ||
                        (cfg.overlayText.useDays && existingState.daysLeftShown !== daysLeft);
                    if (shouldApply) {
                        this.log.info(`Applying overlay to item ${plexId} — "${label}"`);
                        const newState = await this.applyOverlay(plexId, label, deleteDate, existingState, cfg);
                        if (newState) {
                            currentState[plexId] = newState;
                            result.processed++;
                        }
                        else {
                            result.errors++;
                        }
                    }
                    else {
                        this.log.debug(`Skipping item ${plexId} — already processed with same date.`);
                        result.skipped++;
                    }
                    itemsWithDates.push({ plexId, deleteDate, label });
                }
                // 7. Reorder collection
                const collectionOrder = this.resolveCollectionOrder(coll.title, cfg);
                if (collectionOrder !== 'none' && itemsWithDates.length > 1) {
                    const sorted = [...itemsWithDates].sort((a, b) => {
                        const diff = a.deleteDate.getTime() - b.deleteDate.getTime();
                        return collectionOrder === 'asc' ? diff : -diff;
                    });
                    // Find the Plex collection ID via Maintainerr media-server proxy
                    const libraryCollections = await this.maintainerr.getLibraryCollections(coll.libraryId);
                    const targetName = coll.manualCollection
                        ? coll.manualCollectionName
                        : coll.title;
                    const plexColl = libraryCollections.find((c) => c.title.toLowerCase() === targetName.toLowerCase());
                    if (plexColl) {
                        await this.reorderCollection(coll, plexColl.ratingKey, sorted.map((i) => i.plexId), cfg);
                    }
                }
            }
            // 8. Janitor
            currentState = await this.janitorCleanup(allCurrentPlexIds, currentState, cfg);
            // 9. Save state
            this.state.save(currentState);
            this.log.success(`=== Run complete: ${result.processed} applied, ${result.reverted} reverted, ${result.skipped} skipped, ${result.errors} errors ===`);
            this.status = 'idle';
        }
        catch (err) {
            this.log.error(`Unhandled error in processor run: ${err}`);
            this.status = 'error';
        }
        this.lastRun = new Date();
        this.lastResult = result;
        return result;
    }
    resolveCollectionOrder(title, cfg) {
        const t = title.toLowerCase();
        if (cfg.processing.collectionAsc.some((n) => n.toLowerCase() === t))
            return 'asc';
        if (cfg.processing.collectionDesc.some((n) => n.toLowerCase() === t))
            return 'desc';
        return cfg.processing.collectionOrderGlobal;
    }
}
exports.ProcessorService = ProcessorService;
//# sourceMappingURL=ProcessorService.js.map