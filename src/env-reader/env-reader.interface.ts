export interface EnvReaderInterface {
  read(keys: string[]): Record<string, string>;
}
