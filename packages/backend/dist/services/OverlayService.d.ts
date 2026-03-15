import { OverlayRenderOptions, OverlayResult } from '../types/overlay';
import { LogService } from './LogService';
export declare class OverlayService {
    private log;
    private registeredFonts;
    constructor(log: LogService);
    private toFraction;
    private parseColor;
    private isTransparent;
    private getFontFamily;
    private drawRoundRect;
    private computeAnchorX;
    private computeAnchorY;
    private drawFrame;
    private renderPill;
    renderOverlay(posterBuffer: Buffer, opts: OverlayRenderOptions): Promise<OverlayResult>;
}
//# sourceMappingURL=OverlayService.d.ts.map