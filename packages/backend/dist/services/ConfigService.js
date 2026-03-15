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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const defaults_1 = require("../config/defaults");
const env_1 = require("../config/env");
class ConfigService {
    configPath;
    config;
    constructor(dataDir) {
        this.configPath = path.join(dataDir, 'config.json');
        this.config = this.load();
    }
    load() {
        let base = this.deepClone(defaults_1.DEFAULT_CONFIG);
        if (fs.existsSync(this.configPath)) {
            try {
                const raw = fs.readFileSync(this.configPath, 'utf-8');
                const parsed = JSON.parse(raw);
                base = this.deepMerge(base, parsed);
            }
            catch {
                // Corrupted config file; fall back to defaults
            }
        }
        return (0, env_1.applyEnvOverrides)(base);
    }
    get() {
        // Re-apply env overrides so runtime env vars always win
        return (0, env_1.applyEnvOverrides)(this.config);
    }
    update(partial) {
        this.config = this.deepMerge(this.config, partial);
        this.persist();
        return this.get();
    }
    persist() {
        const dir = path.dirname(this.configPath);
        fs.mkdirSync(dir, { recursive: true });
        const tmp = this.configPath + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(this.config, null, 2), 'utf-8');
        fs.renameSync(tmp, this.configPath);
    }
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    deepMerge(base, override) {
        const result = this.deepClone(base);
        for (const key in override) {
            const k = key;
            const val = override[k];
            if (val === undefined || val === null)
                continue;
            if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
                result[key] = this.deepMerge(result[key], val);
            }
            else {
                result[key] = val;
            }
        }
        return result;
    }
}
exports.ConfigService = ConfigService;
//# sourceMappingURL=ConfigService.js.map