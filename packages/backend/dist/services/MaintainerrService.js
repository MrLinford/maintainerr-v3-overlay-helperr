"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintainerrService = void 0;
const axios_1 = __importDefault(require("axios"));
class MaintainerrService {
    baseUrl;
    log;
    client;
    constructor(baseUrl, log) {
        this.baseUrl = baseUrl;
        this.log = log;
        this.client = axios_1.default.create({ baseURL: baseUrl, timeout: 30000 });
    }
    updateBaseUrl(url) {
        this.baseUrl = url;
        this.client.defaults.baseURL = url;
    }
    async testConnection() {
        try {
            await this.client.get('/api/media-server/');
            return true;
        }
        catch {
            return false;
        }
    }
    async getCollections() {
        try {
            const { data } = await this.client.get('/api/collections');
            this.log.info(`Fetched ${data.length} collection(s) from Maintainerr.`);
            return data;
        }
        catch (err) {
            this.log.error(`Failed to fetch Maintainerr collections: ${err}`);
            throw err;
        }
    }
    async getLibraryCollections(libraryId) {
        try {
            const { data } = await this.client.get(`/api/media-server/library/${libraryId}/collections`);
            return data ?? [];
        }
        catch (err) {
            if (axios_1.default.isAxiosError(err) && err.response?.status === 404) {
                this.log.warn(`Library ${libraryId} collections endpoint returned 404.`);
                return [];
            }
            this.log.warn(`Failed to fetch library ${libraryId} collections: ${err}`);
            return [];
        }
    }
}
exports.MaintainerrService = MaintainerrService;
//# sourceMappingURL=MaintainerrService.js.map