import { ConfigMapper } from './config-mapper';
import { EnvReader, EnvReaderInterface, FileEnvReader } from './env-reader';
import {Constructor, Schema, SchemaReaderInterface} from './schema';
import { ParserFactory as ParserFactoryInterface } from './parser-factory.interface';
import { ParserFactory } from './parser-factory';
import {ClassSchemaReader} from "./schema/class-schema-reader";

export type ConfigLoaderOptions<T> = {
  envReader?: EnvReaderInterface;
  schemaReader?: SchemaReaderInterface;
  ctor?: Constructor<T>
};

export class ConfigLoader<T> {
  private readonly envReader: EnvReaderInterface;
  private readonly schemaReader: SchemaReaderInterface;
  private readonly parserFactory: ParserFactoryInterface;

  private configSchema: Schema<T>;
  private configData: any;
  private mapper: ConfigMapper<T>;

  constructor(options: ConfigLoaderOptions<T>) {
    this.envReader = options.envReader ?? this.createDefaultEnvReader();
    this.schemaReader =
      options?.schemaReader ?? this.createDefaultSchemaReader(options.ctor);
    this.parserFactory = new ParserFactory();
  }

  getConfig(): T {
    this.configSchema = this.schemaReader.read();
    this.mapper = new ConfigMapper(this.configSchema, this.parserFactory);
    const readEnv = this.readEnv();
    this.configData = this.mapper.map(readEnv);
    return this.configData;
  }

  public static getConfig<T>(options: ConfigLoaderOptions<T>): T {
    const configLoader = new ConfigLoader<T>(options);
    return configLoader.getConfig();
  }

  private readEnv(): Record<string, string> {
    return this.envReader.read(this.mapper.getEnvKeys());
  }

  private createDefaultEnvReader() {
    const fileReader = new FileEnvReader();
    return new EnvReader(fileReader);
  }

  private createDefaultSchemaReader(ctor: Constructor<T>): SchemaReaderInterface {
    if(!ctor) {
      throw new TypeError('You should provide at least a config constructor')
    }
    return new ClassSchemaReader(ctor);
  }
}
