import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

import { BaseEnvReader } from './base-env-reader';
import { EnvReaderInterface } from './env-reader.interface';
import { pick, exclude } from '../utils';

export type FileEnvReaderOptions = {
  filename?: string; // file base name without dir, by default is .env
  dir?: string; // directory where .env file is placed. By default is cwd()
};

export class FileEnvReader extends BaseEnvReader implements EnvReaderInterface {
  constructor(
    private readonly options?: FileEnvReaderOptions,
    next?: EnvReaderInterface,
  ) {
    super(next);
  }

  read(keys: string[]): Record<string, string> {
    const envFileData = this.readFileData();
    const values = pick(keys, envFileData);
    return {
      ...values,
      ...this.runNextIfExists(exclude(keys, Object.keys(values))),
    };
  }

  private readFileData(): Record<string, string> {
    const filename = this.options?.filename ?? '.env';
    const directory = this.options?.dir ?? process.cwd();
    const filepath = path.join(directory, filename);
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split(os.EOL);
    const result = {};
    for (const line of lines) {
      const parts = line.split('=').map((i) => i.trim());
      if (parts.length && parts[0] !== '') {
        result[parts[0]] = parts[1];
      }
    }
    return result;
  }
}
