import { AppConfig, DeepPartial } from '../types/config';
export declare class ConfigService {
    private configPath;
    private config;
    constructor(dataDir: string);
    private load;
    get(): AppConfig;
    update(partial: DeepPartial<AppConfig>): AppConfig;
    private persist;
    private deepClone;
    private deepMerge;
}
//# sourceMappingURL=ConfigService.d.ts.map