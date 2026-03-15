import { AppConfig } from '../types/config';

function splitList(val: string): string[] {
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBool(val: string): boolean {
  return val.toLowerCase() === 'true' || val === '1';
}

function parseFloat2(val: string, fallback: number): number {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

export function applyEnvOverrides(config: AppConfig): AppConfig {
  const c = structuredClone(config);
  const e = process.env;

  // Connection
  if (e.PLEX_URL) c.plex.url = e.PLEX_URL;
  if (e.PLEX_TOKEN) c.plex.token = e.PLEX_TOKEN;
  if (e.MAINTAINERR_URL) c.maintainerr.url = e.MAINTAINERR_URL;

  // Paths
  if (e.DATA_DIR) c.dataDir = e.DATA_DIR;
  if (e.FONTS_DIR) c.fontsDir = e.FONTS_DIR;
  if (e.TZ) c.timezone = e.TZ;

  // Overlay text
  if (e.OVERLAY_TEXT) c.overlayText.overlayText = e.OVERLAY_TEXT;
  if (e.USE_DAYS) c.overlayText.useDays = parseBool(e.USE_DAYS);
  if (e.TEXT_TODAY) c.overlayText.textToday = e.TEXT_TODAY;
  if (e.TEXT_DAY) c.overlayText.textDay = e.TEXT_DAY;
  if (e.TEXT_DAYS) c.overlayText.textDays = e.TEXT_DAYS;
  if (e.ENABLE_DAY_SUFFIX) c.overlayText.enableDaySuffix = parseBool(e.ENABLE_DAY_SUFFIX);
  if (e.ENABLE_UPPERCASE) c.overlayText.enableUppercase = parseBool(e.ENABLE_UPPERCASE);
  if (e.LANGUAGE) c.overlayText.language = e.LANGUAGE;
  if (e.DATE_FORMAT) c.overlayText.dateFormat = e.DATE_FORMAT;

  // Overlay style
  if (e.FONT_PATH) c.overlayStyle.fontPath = e.FONT_PATH;
  if (e.FONT_COLOR) c.overlayStyle.fontColor = e.FONT_COLOR;
  if (e.BACK_COLOR) c.overlayStyle.backColor = e.BACK_COLOR;
  if (e.FONT_SIZE) c.overlayStyle.fontSize = parseFloat2(e.FONT_SIZE, c.overlayStyle.fontSize);
  if (e.PADDING) c.overlayStyle.padding = parseFloat2(e.PADDING, c.overlayStyle.padding);
  if (e.BACK_RADIUS) c.overlayStyle.backRadius = parseFloat2(e.BACK_RADIUS, c.overlayStyle.backRadius);
  if (e.HORIZONTAL_OFFSET) c.overlayStyle.horizontalOffset = parseFloat2(e.HORIZONTAL_OFFSET, c.overlayStyle.horizontalOffset);
  if (e.HORIZONTAL_ALIGN && ['left', 'center', 'right'].includes(e.HORIZONTAL_ALIGN)) {
    c.overlayStyle.horizontalAlign = e.HORIZONTAL_ALIGN as 'left' | 'center' | 'right';
  }
  if (e.VERTICAL_OFFSET) c.overlayStyle.verticalOffset = parseFloat2(e.VERTICAL_OFFSET, c.overlayStyle.verticalOffset);
  if (e.VERTICAL_ALIGN && ['top', 'center', 'bottom'].includes(e.VERTICAL_ALIGN)) {
    c.overlayStyle.verticalAlign = e.VERTICAL_ALIGN as 'top' | 'center' | 'bottom';
  }
  if (e.OVERLAY_BOTTOM_CENTER) c.overlayStyle.overlayBottomCenter = parseBool(e.OVERLAY_BOTTOM_CENTER);

  // Frame
  if (e.USE_FRAME) c.frame.useFrame = parseBool(e.USE_FRAME);
  if (e.FRAME_COLOR) c.frame.frameColor = e.FRAME_COLOR;
  if (e.FRAME_WIDTH) c.frame.frameWidth = parseFloat2(e.FRAME_WIDTH, c.frame.frameWidth);
  if (e.FRAME_RADIUS) c.frame.frameRadius = parseFloat2(e.FRAME_RADIUS, c.frame.frameRadius);
  if (e.FRAME_INNER_RADIUS) c.frame.frameInnerRadius = parseFloat2(e.FRAME_INNER_RADIUS, c.frame.frameInnerRadius);
  if (e.FRAME_INNER_RADIUS_MODE && ['auto', 'absolute'].includes(e.FRAME_INNER_RADIUS_MODE)) {
    c.frame.frameInnerRadiusMode = e.FRAME_INNER_RADIUS_MODE as 'auto' | 'absolute';
  }
  if (e.FRAME_INSET && ['outside', 'inside', 'flush'].includes(e.FRAME_INSET)) {
    c.frame.frameInset = e.FRAME_INSET as 'outside' | 'inside' | 'flush';
  }
  if (e.DOCK_STYLE && ['bar', 'pill'].includes(e.DOCK_STYLE)) {
    c.frame.dockStyle = e.DOCK_STYLE as 'bar' | 'pill';
  }
  if (e.DOCK_POSITION && ['top', 'bottom'].includes(e.DOCK_POSITION)) {
    c.frame.dockPosition = e.DOCK_POSITION as 'top' | 'bottom';
  }

  // Scheduler
  if (e.CRON_SCHEDULE) c.scheduler.cronSchedule = e.CRON_SCHEDULE;
  if (e.RUN_ON_CREATION) c.scheduler.runOnStart = parseBool(e.RUN_ON_CREATION);

  // Processing
  if (e.PROCESS_COLLECTIONS) c.processing.processCollections = splitList(e.PROCESS_COLLECTIONS);
  if (e.REAPPLY_OVERLAY) c.processing.reapplyOverlay = parseBool(e.REAPPLY_OVERLAY);
  if (e.FORCE_JPEG_UPLOAD) c.processing.forceJpegUpload = parseBool(e.FORCE_JPEG_UPLOAD);
  if (e.PLEX_COLLECTION_ORDER && ['asc', 'desc', 'none'].includes(e.PLEX_COLLECTION_ORDER)) {
    c.processing.collectionOrderGlobal = e.PLEX_COLLECTION_ORDER as 'asc' | 'desc' | 'none';
  }
  if (e.COLLECTION_ASC) c.processing.collectionAsc = splitList(e.COLLECTION_ASC);
  if (e.COLLECTION_DESC) c.processing.collectionDesc = splitList(e.COLLECTION_DESC);

  return c;
}
