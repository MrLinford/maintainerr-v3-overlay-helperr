"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlexService = void 0;
const axios_1 = __importDefault(require("axios"));
class PlexService {
    baseUrl;
    token;
    log;
    client;
    constructor(baseUrl, token, log) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.log = log;
        this.client = this.buildClient(baseUrl, token);
    }
    buildClient(baseUrl, token) {
        return axios_1.default.create({
            baseURL: baseUrl,
            timeout: 60000,
            headers: {
                'X-Plex-Token': token,
                Accept: 'application/json',
            },
        });
    }
    updateConnection(url, token) {
        this.baseUrl = url;
        this.token = token;
        this.client = this.buildClient(url, token);
    }
    async testConnection() {
        try {
            await this.client.get('/');
            return true;
        }
        catch {
            return false;
        }
    }
    // Returns the thumb path (e.g. /library/metadata/12345/thumb/67890)
    // Caller is responsible for building the full URL via downloadPoster()
    async getBestPosterUrl(plexId) {
        try {
            const { data } = await this.client.get(`/library/metadata/${plexId}`);
            const mc = data?.MediaContainer;
            if (!mc)
                return null;
            // Plex puts items under Metadata (movies/shows), Video (episodes), or Directory (seasons)
            const candidates = [mc.Metadata, mc.Video, mc.Directory]
                .flat()
                .filter(Boolean);
            for (const item of candidates) {
                if (item.thumb)
                    return item.thumb;
            }
            return null;
        }
        catch (err) {
            this.log.debug(`getBestPosterUrl(${plexId}) failed: ${err}`);
            return null;
        }
    }
    async downloadPoster(thumbPath) {
        const url = thumbPath.startsWith('http')
            ? thumbPath
            : `${this.baseUrl}${thumbPath}`;
        const { data } = await axios_1.default.get(url, {
            responseType: 'arraybuffer',
            headers: { 'X-Plex-Token': this.token, Accept: '*/*' },
            timeout: 60000,
        });
        const buf = Buffer.from(data);
        if (buf.length < 1024)
            throw new Error(`Downloaded poster too small (${buf.length} bytes)`);
        return buf;
    }
    async getPosters(plexId) {
        try {
            const { data } = await this.client.get(`/library/metadata/${plexId}/posters`);
            const photos = data?.MediaContainer?.Photo;
            if (!photos)
                return [];
            return (Array.isArray(photos) ? photos : [photos]);
        }
        catch {
            return [];
        }
    }
    getUploadPosterIds(photos) {
        return [
            ...new Set(photos
                .map((p) => p.ratingKey ?? p.key ?? '')
                .filter((k) => k.startsWith('upload://posters/'))
                .map((k) => k.slice('upload://posters/'.length))),
        ];
    }
    async uploadPoster(plexId, buffer, contentType) {
        await this.client.post(`/library/metadata/${plexId}/posters`, buffer, {
            headers: { 'Content-Type': contentType },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });
    }
    async selectPoster(plexId, uploadId) {
        try {
            await this.client.put(`/library/metadata/${plexId}/poster`, null, {
                params: { url: `upload://posters/${uploadId}` },
            });
            return true;
        }
        catch (err) {
            this.log.warn(`Failed to select poster ${uploadId} for ${plexId}: ${err}`);
            return false;
        }
    }
    async deleteUploadedPoster(plexId, uploadId) {
        try {
            await this.client.delete(`/library/metadata/${plexId}/posters`, {
                params: { url: `upload://posters/${uploadId}` },
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async itemExists(plexId) {
        try {
            await this.client.get(`/library/metadata/${plexId}`);
            return true;
        }
        catch {
            return false;
        }
    }
    async setCollectionCustomSort(collectionId) {
        await this.client.put(`/library/metadata/${collectionId}/prefs`, 'collectionSort=2', { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    }
    async moveCollectionItem(collectionId, itemId, afterId) {
        await this.client.put(`/library/collections/${collectionId}/items/${itemId}/move`, null, { params: { after: afterId } });
    }
}
exports.PlexService = PlexService;
//# sourceMappingURL=PlexService.js.map