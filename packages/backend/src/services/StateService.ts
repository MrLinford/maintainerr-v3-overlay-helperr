import * as fs from 'fs';
import * as path from 'path';
import { CollectionState } from '../types/state';

export class StateService {
  private statePath: string;

  constructor(dataDir: string) {
    this.statePath = path.join(dataDir, 'collection_state.json');
  }

  load(): CollectionState {
    if (!fs.existsSync(this.statePath)) return {};
    try {
      return JSON.parse(fs.readFileSync(this.statePath, 'utf-8')) as CollectionState;
    } catch {
      return {};
    }
  }

  save(state: CollectionState): void {
    const dir = path.dirname(this.statePath);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = this.statePath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmp, this.statePath);
  }

  clear(): void {
    this.save({});
  }

  getAll(): CollectionState {
    return this.load();
  }

  removeItem(plexId: string): void {
    const state = this.load();
    delete state[plexId];
    this.save(state);
  }
}
