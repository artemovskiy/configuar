import { JSONSchema6 } from 'json-schema';
import { validate } from 'jsonschema';

import { ConfigMapper } from './config-mapper';
import { EnvReader, EnvReaderInterface, FileEnvReader } from './env-reader';
import { SchemaReaderInterface, FileSchemaReader } from './schema-reader';
import { ParserFactory as ParserFactoryInterface } from './parser-factory.interface';
import { ParserFactory } from './parser-factory';

export type ConfigLoaderOptions = {
  envReader?: EnvReaderInterface;
  schemaReader?: SchemaReaderInterface;
};

export class ConfigLoader<T> {
  private readonly envReader: EnvReaderInterface;
  private readonly schemaReader: SchemaReaderInterface;
  private readonly parserFactory: ParserFactoryInterface;

  private configSchema: JSONSchema6;
  private configData: any;
  private mapper: ConfigMapper;

  constructor(options?: ConfigLoaderOptions) {
    this.envReader = options?.envReader ?? this.createDefaultEnvReader();
    this.schemaReader =
      options?.schemaReader ?? this.createDefaultSchemaReader();
    this.parserFactory = new ParserFactory();
  }

  getConfig(): T {
    this.configSchema = this.schemaReader.read();
    this.mapper = new ConfigMapper(this.configSchema, this.parserFactory);
    this.configData = this.mapper.map(this.readEnv());
    this.validate();
    return this.configData;
  }

  public static getConfig<T>(options?: ConfigLoaderOptions): T {
    const configLoader = new ConfigLoader<T>(options);
    return configLoader.getConfig();
  }

  private readEnv(): Record<string, string> {
    return this.envReader.read(this.mapper.getEnvKeys());
  }

  private validate() {
    const result = validate(this.configData, this.configSchema);
    console.log(result);
  }

  private createDefaultEnvReader() {
    const fileReader = new FileEnvReader();
    return new EnvReader(fileReader);
  }

  private createDefaultSchemaReader(): SchemaReaderInterface {
    return new FileSchemaReader('config-schema.yaml');
  }
}
