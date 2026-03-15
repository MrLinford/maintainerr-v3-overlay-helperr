export interface PlexConfig {
  url: string;
  token: string;
}

export interface MaintainerrConfig {
  url: string;
}

export interface OverlayTextConfig {
  overlayText: string;
  useDays: boolean;
  textToday: string;
  textDay: string;
  textDays: string;
  enableDaySuffix: boolean;
  enableUppercase: boolean;
  language: string;
  dateFormat: string;
}

export interface OverlayStyleConfig {
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
}

export interface FrameConfig {
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

export interface SchedulerConfig {
  cronSchedule: string;
  runOnStart: boolean;
}

export interface ProcessingConfig {
  processCollections: string[];
  reapplyOverlay: boolean;
  forceJpegUpload: boolean;
  collectionOrderGlobal: 'asc' | 'desc' | 'none';
  collectionAsc: string[];
  collectionDesc: string[];
  reorderOnly: boolean;
  reorderOnlyCollections: string[];
}

export interface AppConfig {
  plex: PlexConfig;
  maintainerr: MaintainerrConfig;
  overlayText: OverlayTextConfig;
  overlayStyle: OverlayStyleConfig;
  frame: FrameConfig;
  scheduler: SchedulerConfig;
  processing: ProcessingConfig;
  dataDir: string;
  fontsDir: string;
  timezone: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
