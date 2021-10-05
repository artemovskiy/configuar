import { EnvReaderInterface } from './env-reader.interface';
import { exclude } from '../utils/array';
import { BaseEnvReader } from './base-env-reader';

export class EnvReader extends BaseEnvReader implements EnvReaderInterface {
  read(keys: string[]): Record<string, string> {
    const values: Record<string, string> = {};
    const { env } = process;

    for (const key of keys) {
      if (typeof env[key] !== 'undefined') {
        values[key] = env[key];
      }
    }

    return {
      ...values,
      ...this.runNextIfExists(exclude(keys, Object.keys(values))),
    };
  }
}
