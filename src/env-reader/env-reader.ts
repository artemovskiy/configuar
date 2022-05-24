import { EnvReaderInterface } from './env-reader.interface';
import { exclude } from '../utils';
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


    const remainingKeys = exclude(keys, Object.keys(values));
    const nextRun = this.runNextIfExists(remainingKeys);
    return {
      ...values,
      ...nextRun,
    };
  }
}
