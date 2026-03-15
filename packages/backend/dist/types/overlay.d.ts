export interface OverlayRenderOptions {
    text: string;
    fontPath: string;
    fontColor: string;
    backColor: string;
    fontSize: number;
    padding: number;
    backRadius: number;
    horizontalOffset: number;
    horizontalAlign: 'left' | 'center' | 'right';
    verticalOffset: number;
    verticalAlign: 'top' | 'center' | 'bottom';
    overlayBottomCenter: boolean;
    useFrame: boolean;
    frameColor: string;
    frameWidth: number;
    frameRadius: number;
    frameInnerRadius: number;
    frameInnerRadiusMode: 'auto' | 'absolute';
    frameInset: 'outside' | 'inside' | 'flush';
    dockStyle: 'bar' | 'pill';
    dockPosition: 'top' | 'bottom';
}
export interface OverlayResult {
    buffer: Buffer;
    contentType: 'image/jpeg';
}
//# sourceMappingURL=overlay.d.ts.map