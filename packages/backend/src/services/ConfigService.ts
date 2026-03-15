import * as fs from 'fs';
import * as path from 'path';
import { AppConfig, DeepPartial } from '../types/config';
import { DEFAULT_CONFIG } from '../config/defaults';
import { applyEnvOverrides } from '../config/env';

export class ConfigService {
  private configPath: string;
  private config: AppConfig;

  constructor(dataDir: string) {
    this.configPath = path.join(dataDir, 'config.json');
    this.config = this.load();
  }

  private load(): AppConfig {
    let base: AppConfig = this.deepClone(DEFAULT_CONFIG);
    if (fs.existsSync(this.configPath)) {
      try {
        const raw = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(raw) as DeepPartial<AppConfig>;
        base = this.deepMerge(base, parsed);
      } catch {
        // Corrupted config file; fall back to defaults
      }
    }
    return applyEnvOverrides(base);
  }

  get(): AppConfig {
    // Re-apply env overrides so runtime env vars always win
    return applyEnvOverrides(this.config);
  }

  update(partial: DeepPartial<AppConfig>): AppConfig {
    this.config = this.deepMerge(this.config, partial);
    this.persist();
    return this.get();
  }

  private persist(): void {
    const dir = path.dirname(this.configPath);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = this.configPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.config, null, 2), 'utf-8');
    fs.renameSync(tmp, this.configPath);
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private deepMerge<T>(base: T, override: DeepPartial<T>): T {
    const result = this.deepClone(base);
    for (const key in override) {
      const k = key as keyof T;
      const val = override[k];
      if (val === undefined || val === null) continue;
      if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
        (result as Record<string, unknown>)[key] = this.deepMerge(
          (result as Record<string, unknown>)[key] as DeepPartial<T[typeof k]>,
          val as DeepPartial<T[typeof k]>,
        );
      } else {
        (result as Record<string, unknown>)[key] = val;
      }
    }
    return result;
  }
}
