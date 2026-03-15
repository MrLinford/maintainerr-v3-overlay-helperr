import client from './client';

export interface AppConfig {
  plex: { url: string; token: string };
  maintainerr: { url: string };
  overlayText: {
    overlayText: string;
    useDays: boolean;
    textToday: string;
    textDay: string;
    textDays: string;
    enableDaySuffix: boolean;
    enableUppercase: boolean;
    language: string;
    dateFormat: string;
  };
  overlayStyle: {
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
  };
  frame: {
    useFrame: boolean;
    frameColor: string;
    frameWidth: number;
    frameRadius: number;
    frameInnerRadius: number;
    frameInnerRadiusMode: 'auto' | 'absolute';
    frameInset: 'outside' | 'inside' | 'flush';
    dockStyle: 'bar' | 'pill';
    dockPosition: 'top' | 'bottom';
  };
  scheduler: { cronSchedule: string; runOnStart: boolean };
  processing: {
    processCollections: string[];
    reapplyOverlay: boolean;
    forceJpegUpload: boolean;
    collectionOrderGlobal: 'asc' | 'desc' | 'none';
    collectionAsc: string[];
    collectionDesc: string[];
    reorderOnly: boolean;
    reorderOnlyCollections: string[];
  };
  dataDir: string;
  fontsDir: string;
  timezone: string;
}

export async function getConfig(): Promise<AppConfig> {
  const { data } = await client.get<AppConfig>('/config');
  return data;
}

export async function updateConfig(partial: Partial<AppConfig>): Promise<AppConfig> {
  const { data } = await client.put<AppConfig>('/config', partial);
  return data;
}

export async function testPlexConnection(): Promise<boolean> {
  const { data } = await client.post<{ success: boolean }>('/config/test-plex');
  return data.success;
}

export async function testMaintainerrConnection(): Promise<boolean> {
  const { data } = await client.post<{ success: boolean }>('/config/test-maintainerr');
  return data.success;
}
