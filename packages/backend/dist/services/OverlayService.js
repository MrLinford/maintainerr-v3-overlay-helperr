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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const canvas_1 = require("canvas");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class OverlayService {
    log;
    registeredFonts = new Map(); // fontPath → family name
    constructor(log) {
        this.log = log;
    }
    // ─── Helpers ─────────────────────────────────────────────────────────────
    toFraction(v) {
        // Values stored as percentages (5.5 → 0.055)
        if (v <= 1.0)
            return v;
        return v / 100.0;
    }
    parseColor(hex) {
        const t = hex.trim();
        // Convert 8-digit hex (#RRGGBBAA) → rgba(r,g,b,a) for canvas
        if (/^#[0-9A-Fa-f]{8}$/.test(t)) {
            const r = parseInt(t.slice(1, 3), 16);
            const g = parseInt(t.slice(3, 5), 16);
            const b = parseInt(t.slice(5, 7), 16);
            const a = parseInt(t.slice(7, 9), 16) / 255;
            return `rgba(${r},${g},${b},${a.toFixed(3)})`;
        }
        return t;
    }
    isTransparent(color) {
        const c = color.trim().toLowerCase();
        return c === 'none' || c === 'transparent' || c === 'rgba(0,0,0,0)';
    }
    getFontFamily(fontPath) {
        if (this.registeredFonts.has(fontPath)) {
            return this.registeredFonts.get(fontPath);
        }
        if (fs.existsSync(fontPath)) {
            const family = path.basename(fontPath, path.extname(fontPath));
            try {
                (0, canvas_1.registerFont)(fontPath, { family });
                this.registeredFonts.set(fontPath, family);
                return family;
            }
            catch (err) {
                this.log.warn(`Failed to register font at ${fontPath}: ${err}`);
            }
        }
        else {
            this.log.warn(`Font file not found: ${fontPath}`);
        }
        return 'sans-serif';
    }
    drawRoundRect(ctx, x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.arcTo(x + w, y, x + w, y + radius, radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
        ctx.lineTo(x + radius, y + h);
        ctx.arcTo(x, y + h, x, y + h - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }
    computeAnchorX(align, imgW, boxW, offsetFrac) {
        const offset = Math.round(imgW * offsetFrac);
        switch (align) {
            case 'left': return Math.max(0, offset);
            case 'right': return Math.max(0, imgW - boxW - offset);
            case 'center': return Math.max(0, Math.round((imgW - boxW) / 2));
            default: return 0;
        }
    }
    computeAnchorY(align, imgH, boxH, offsetFrac) {
        const offset = Math.round(imgH * offsetFrac);
        switch (align) {
            case 'top': return Math.max(0, offset);
            case 'bottom': return Math.max(0, imgH - boxH - offset);
            case 'center': return Math.max(0, Math.round((imgH - boxH) / 2));
            default: return 0;
        }
    }
    // ─── Frame drawing ───────────────────────────────────────────────────────
    async drawFrame(posterBuf, opts) {
        const { imgW, imgH, strokeW, outerR, innerR, frameColor } = opts;
        // Create a mask canvas: white rounded rect (outer) minus black rounded rect (inner) = donut
        const maskCanvas = (0, canvas_1.createCanvas)(imgW, imgH);
        const mCtx = maskCanvas.getContext('2d');
        // Fill black background
        mCtx.fillStyle = 'black';
        mCtx.fillRect(0, 0, imgW, imgH);
        // White outer rect (the frame area)
        const margin = Math.floor(strokeW / 2);
        mCtx.fillStyle = 'white';
        this.drawRoundRect(mCtx, margin, margin, imgW - margin * 2, imgH - margin * 2, outerR);
        mCtx.fill();
        // Black inner rect (carve out center)
        mCtx.fillStyle = 'black';
        const innerM = margin + strokeW;
        this.drawRoundRect(mCtx, innerM, innerM, imgW - innerM * 2, imgH - innerM * 2, innerR);
        mCtx.fill();
        const maskBuf = maskCanvas.toBuffer('image/png');
        // Color layer (solid frame color)
        const colorBuf = await (0, sharp_1.default)({
            create: { width: imgW, height: imgH, channels: 4, background: frameColor },
        })
            .png()
            .toBuffer();
        // Apply mask to color layer
        const frameBuf = await (0, sharp_1.default)(colorBuf)
            .composite([{ input: maskBuf, blend: 'dest-in' }])
            .png()
            .toBuffer();
        // Composite frame over poster
        return await (0, sharp_1.default)(posterBuf)
            .composite([{ input: frameBuf, blend: 'over' }])
            .png()
            .toBuffer();
    }
    // ─── Pill rendering (background + text) ──────────────────────────────────
    renderPill(p) {
        const canvas = (0, canvas_1.createCanvas)(p.targetW, p.targetH);
        const ctx = canvas.getContext('2d');
        // Background
        if (!this.isTransparent(p.backColor)) {
            ctx.fillStyle = p.backColor;
            this.drawRoundRect(ctx, 0, 0, p.targetW, p.targetH, p.effRad);
            ctx.fill();
        }
        // Shadow (drawn under text)
        if (p.withShadow) {
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = Math.ceil(p.pointSize * 0.08);
            ctx.shadowOffsetX = Math.ceil(p.pointSize * 0.05);
            ctx.shadowOffsetY = Math.ceil(p.pointSize * 0.05);
        }
        // Text
        ctx.fillStyle = p.fontColor;
        ctx.font = `${p.pointSize}px "${p.fontFamily}"`;
        ctx.textBaseline = 'middle';
        ctx.fillText(p.text, p.padPx, p.targetH / 2);
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        return canvas.toBuffer('image/png');
    }
    // ─── Main entry point ─────────────────────────────────────────────────────
    async renderOverlay(posterBuffer, opts) {
        const meta = await (0, sharp_1.default)(posterBuffer).metadata();
        const imgW = meta.width;
        const imgH = meta.height;
        const shortSide = Math.min(imgW, imgH);
        const MIN_FONT_FRAC = 0.02;
        const MAX_FONT_FRAC = 0.10;
        const WIDTH_BUDGET = 0.88;
        const fontFrac = this.toFraction(opts.fontSize);
        const padFrac = this.toFraction(opts.padding);
        const radFrac = this.toFraction(opts.backRadius);
        const offXFrac = this.toFraction(opts.horizontalOffset);
        const offYFrac = this.toFraction(opts.verticalOffset);
        // ── Font & text measurement ──────────────────────────────────────────
        const fontFamily = this.getFontFamily(opts.fontPath);
        const maxBoxW = Math.floor(imgW * WIDTH_BUDGET);
        let pointSize = Math.round(imgH * Math.min(MAX_FONT_FRAC, Math.max(MIN_FONT_FRAC, fontFrac)));
        const measure = (0, canvas_1.createCanvas)(1, 1);
        const mCtx = measure.getContext('2d');
        mCtx.font = `${pointSize}px "${fontFamily}"`;
        let tm = mCtx.measureText(opts.text);
        // Shrink-to-fit
        while (tm.width > maxBoxW && pointSize > Math.round(imgH * MIN_FONT_FRAC)) {
            pointSize = Math.max(Math.round(imgH * MIN_FONT_FRAC), pointSize - Math.ceil(Math.max(1, pointSize * 0.08)));
            mCtx.font = `${pointSize}px "${fontFamily}"`;
            tm = mCtx.measureText(opts.text);
        }
        const labelW = Math.ceil(tm.width);
        const labelH = Math.ceil(tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent);
        // ── Pill geometry ────────────────────────────────────────────────────
        let padPx = Math.max(2, Math.round(Math.max(imgH * padFrac, pointSize * 0.45)));
        let effRad = Math.round(Math.max(imgH * radFrac, pointSize * 0.35));
        let targetW = labelW + 2 * padPx;
        let targetH = labelH + 2 * padPx;
        effRad = Math.min(effRad, Math.floor(Math.min(targetW, targetH) / 2));
        // ── Dock / frame adjustments ──────────────────────────────────────────
        let strokeW = 0;
        let innerInsetPx = 0;
        let outerR = 0;
        let innerR = 0;
        if (opts.useFrame) {
            const fwFrac = Math.max(this.toFraction(opts.frameWidth), 0.0001);
            strokeW = Math.max(1, Math.round(shortSide * fwFrac));
            innerInsetPx = Math.ceil(strokeW / 2);
            outerR = Math.max(0, Math.round(shortSide * this.toFraction(opts.frameRadius)));
            const innerFracR = this.toFraction(opts.frameInnerRadius);
            innerR =
                opts.frameInnerRadiusMode === 'auto'
                    ? Math.max(0, outerR - strokeW)
                    : Math.min(outerR, Math.max(0, Math.round(shortSide * innerFracR)));
            if (opts.dockStyle === 'bar') {
                targetW = Math.max(1, imgW - 2 * innerInsetPx);
                const basisR = innerR > 0 ? innerR : outerR;
                effRad = Math.min(Math.floor(targetH / 2), Math.round(Math.max(0, basisR * 0.5)));
            }
            else {
                const basisR = innerR > 0 ? innerR : outerR;
                if (basisR > 0)
                    effRad = Math.min(effRad, Math.max(4, Math.round(basisR * 0.9)));
            }
        }
        // ── Alignment ─────────────────────────────────────────────────────────
        let hAlign = opts.horizontalAlign;
        let vAlign = opts.verticalAlign;
        if (opts.overlayBottomCenter) {
            hAlign = 'center';
            vAlign = 'bottom';
        }
        let anchorX;
        let anchorY;
        if (opts.useFrame) {
            anchorX = Math.round((imgW - targetW) / 2);
            anchorY =
                opts.dockPosition === 'top'
                    ? innerInsetPx
                    : imgH - targetH - innerInsetPx;
        }
        else {
            anchorX = this.computeAnchorX(hAlign, imgW, targetW, offXFrac);
            anchorY = this.computeAnchorY(vAlign, imgH, targetH, offYFrac);
        }
        // Clamp to image bounds
        anchorX = Math.max(0, Math.min(anchorX, imgW - targetW));
        anchorY = Math.max(0, Math.min(anchorY, imgH - targetH));
        // ── Render pill ────────────────────────────────────────────────────────
        const pillBuf = this.renderPill({
            text: opts.text,
            fontFamily,
            pointSize,
            targetW,
            targetH,
            effRad,
            padPx,
            fontColor: this.parseColor(opts.fontColor),
            backColor: this.parseColor(opts.useFrame ? opts.frameColor : opts.backColor),
            withShadow: !opts.useFrame,
        });
        // ── Apply frame then composite ─────────────────────────────────────────
        let workBuf = posterBuffer;
        if (opts.useFrame) {
            workBuf = await this.drawFrame(workBuf, {
                imgW,
                imgH,
                strokeW,
                outerR,
                innerR,
                frameColor: this.parseColor(opts.frameColor),
                inset: opts.frameInset,
            });
        }
        const resultBuf = await (0, sharp_1.default)(workBuf)
            .composite([{ input: pillBuf, left: anchorX, top: anchorY, blend: 'over' }])
            .jpeg({ quality: 92 })
            .toBuffer();
        return { buffer: resultBuf, contentType: 'image/jpeg' };
    }
}
exports.OverlayService = OverlayService;
//# sourceMappingURL=OverlayService.js.map