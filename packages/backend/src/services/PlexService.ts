import axios, { AxiosInstance } from 'axios';
import { PlexPhoto } from '../types/plex';
import { LogService } from './LogService';

export class PlexService {
  private client: AxiosInstance;

  constructor(
    private baseUrl: string,
    private token: string,
    private log: LogService,
  ) {
    this.client = this.buildClient(baseUrl, token);
  }

  private buildClient(baseUrl: string, token: string): AxiosInstance {
    return axios.create({
      baseURL: baseUrl,
      timeout: 60000,
      headers: {
        'X-Plex-Token': token,
        Accept: 'application/json',
      },
    });
  }

  updateConnection(url: string, token: string): void {
    this.baseUrl = url;
    this.token = token;
    this.client = this.buildClient(url, token);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/');
      return true;
    } catch {
      return false;
    }
  }

  // Returns the thumb path (e.g. /library/metadata/12345/thumb/67890)
  // Caller is responsible for building the full URL via downloadPoster()
  async getBestPosterUrl(plexId: string): Promise<string | null> {
    try {
      const { data } = await this.client.get(`/library/metadata/${plexId}`);

      const mc = data?.MediaContainer;
      if (!mc) return null;

      // Plex puts items under Metadata (movies/shows), Video (episodes), or Directory (seasons)
      const candidates = [mc.Metadata, mc.Video, mc.Directory]
        .flat()
        .filter(Boolean) as Array<{ thumb?: string; art?: string }>;

      for (const item of candidates) {
        if (item.thumb) return item.thumb;
      }

      return null;
    } catch (err) {
      this.log.debug(`getBestPosterUrl(${plexId}) failed: ${err}`);
      return null;
    }
  }

  async downloadPoster(thumbPath: string): Promise<Buffer> {
    const url = thumbPath.startsWith('http')
      ? thumbPath
      : `${this.baseUrl}${thumbPath}`;
    const { data } = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      headers: { 'X-Plex-Token': this.token, Accept: '*/*' },
      timeout: 60000,
    });
    const buf = Buffer.from(data);
    if (buf.length < 1024) throw new Error(`Downloaded poster too small (${buf.length} bytes)`);
    return buf;
  }

  async getPosters(plexId: string): Promise<PlexPhoto[]> {
    try {
      const { data } = await this.client.get(`/library/metadata/${plexId}/posters`);
      const mc = data?.MediaContainer;
      // Plex returns posters under "Metadata" in current API versions (not "Photo")
      const photos = mc?.Metadata ?? mc?.Photo;
      if (!photos) {
        this.log.debug(`getPosters(${plexId}): no poster array — raw: ${JSON.stringify(mc)}`);
        return [];
      }
      return (Array.isArray(photos) ? photos : [photos]) as PlexPhoto[];
    } catch (err) {
      this.log.debug(`getPosters(${plexId}) failed: ${err}`);
      return [];
    }
  }

  getUploadPosterIds(photos: PlexPhoto[]): string[] {
    const ids: string[] = [];
    for (const p of photos) {
      const id = this.extractUploadPosterId(p);
      if (id) ids.push(id);
    }
    return [...new Set(ids)];
  }

  /** Returns the upload-poster ID of the currently selected poster, or null. */
  getSelectedUploadPosterId(photos: PlexPhoto[]): string | null {
    for (const p of photos) {
      const sel = p.selected;
      // Skip if falsy (undefined, false, empty string, '0')
      if (!sel || sel === '0') continue;
      const id = this.extractUploadPosterId(p);
      if (id) return id;
    }
    return null;
  }

  private extractUploadPosterId(p: PlexPhoto): string | null {
    // ratingKey is usually 'upload://posters/{hash}' for custom uploads
    const rk = p.ratingKey ?? '';
    if (rk.startsWith('upload://posters/')) return rk.slice('upload://posters/'.length);
    // key can be '/library/metadata/.../posters?url=upload%3A%2F%2Fposters%2F{hash}'
    // or sometimes 'upload://posters/{hash}' directly
    const k = p.key ?? '';
    if (k.startsWith('upload://posters/')) return k.slice('upload://posters/'.length);
    if (k.includes('upload') && k.includes('posters')) {
      const urlParam = new URLSearchParams(k.split('?')[1] ?? '').get('url');
      if (urlParam) {
        const decoded = decodeURIComponent(urlParam);
        if (decoded.startsWith('upload://posters/')) return decoded.slice('upload://posters/'.length);
      }
    }
    return null;
  }

  async uploadPoster(plexId: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.client.post(`/library/metadata/${plexId}/posters`, buffer, {
      headers: { 'Content-Type': contentType },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  }

  async selectPoster(plexId: string, uploadId: string): Promise<boolean> {
    try {
      await this.client.put(`/library/metadata/${plexId}/poster`, null, {
        params: { url: `upload://posters/${uploadId}` },
      });
      return true;
    } catch (err) {
      this.log.warn(`Failed to select poster ${uploadId} for ${plexId}: ${err}`);
      return false;
    }
  }

  async deleteUploadedPoster(plexId: string, uploadId: string): Promise<boolean> {
    try {
      await this.client.delete(`/library/metadata/${plexId}/posters`, {
        params: { url: `upload://posters/${uploadId}` },
      });
      return true;
    } catch {
      return false;
    }
  }

  async itemExists(plexId: string): Promise<boolean> {
    try {
      await this.client.get(`/library/metadata/${plexId}`);
      return true;
    } catch {
      return false;
    }
  }

  async getRandomLibraryItem(): Promise<{ plexId: string; title: string } | null> {
    try {
      // 1. Fetch all library sections
      const { data: sectionsData } = await this.client.get('/library/sections');
      const sections: Array<{ key: string; type: string; title: string }> =
        sectionsData?.MediaContainer?.Directory ?? [];

      // Filter to media sections (movies and shows)
      const mediaSections = sections.filter(
        (s) => s.type === 'movie' || s.type === 'show',
      );
      if (!mediaSections.length) return null;

      // 2. Pick a random section and fetch a sample of items
      const section = mediaSections[Math.floor(Math.random() * mediaSections.length)];
      const { data: itemsData } = await this.client.get(
        `/library/sections/${section.key}/all`,
        { params: { 'X-Plex-Container-Start': 0, 'X-Plex-Container-Size': 50 } },
      );

      const mc = itemsData?.MediaContainer;
      const items: Array<{ ratingKey: string; title?: string; thumb?: string }> =
        mc?.Metadata ?? mc?.Video ?? mc?.Directory ?? [];

      // Filter to items that have a poster thumbnail
      const withThumb = items.filter((i) => i.thumb);
      if (!withThumb.length) return null;

      // 3. Pick a random item from the sample
      const item = withThumb[Math.floor(Math.random() * withThumb.length)];
      return {
        plexId: String(item.ratingKey),
        title: item.title ?? String(item.ratingKey),
      };
    } catch (err) {
      this.log.debug(`getRandomLibraryItem failed: ${err}`);
      return null;
    }
  }

  async setCollectionCustomSort(collectionId: string): Promise<void> {
    await this.client.put(
      `/library/metadata/${collectionId}/prefs`,
      null,
      { params: { collectionSort: 2 } },
    );
  }

  async moveCollectionItem(
    collectionId: string,
    itemId: string,
    afterId: string,
  ): Promise<void> {
    await this.client.put(
      `/library/collections/${collectionId}/items/${itemId}/move`,
      null,
      { params: { after: afterId } },
    );
  }
}
