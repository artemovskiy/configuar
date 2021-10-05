import { EnvReaderInterface } from './env-reader.interface';

export abstract class BaseEnvReader {
  private next?: EnvReaderInterface;

  constructor(next?: EnvReaderInterface) {
    this.next = next;
  }

  protected runNextIfExists(keys: string[]): Record<string, string> {
    return this.next && keys.length ? this.next.read(keys) : {};
  }
}
