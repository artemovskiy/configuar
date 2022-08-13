import { MetadataStorage, TypeExplorer } from 'typereader';
import ConfigMapper from './config-mapper';
import { EnvReader, EnvReaderInterface, FileEnvReader } from './env-reader';
import { ParserFactory as ParserFactoryInterface } from './parser-factory.interface';
import ParserFactory from './parser-factory';

export type ConfigLoaderOptions = {
  envReader?: EnvReaderInterface;
  ctor: { new (...args: any[]): any };
};

export class ConfigLoader<T> {
  private readonly envReader: EnvReaderInterface;

  private readonly parserFactory: ParserFactoryInterface;

  private readonly typeExplorer: TypeExplorer;

  private readonly ctor: { new (...args: any[]): any };

  private configData: any;

  private mapper: ConfigMapper<T>;

  constructor(options: ConfigLoaderOptions) {
    this.typeExplorer = new TypeExplorer(MetadataStorage.instance());
    this.ctor = options.ctor;
    this.envReader = options.envReader ?? this.createDefaultEnvReader();
    this.parserFactory = new ParserFactory();
  }

  getConfig(): T {
    const classType = this.typeExplorer.getClassType(this.ctor);
    this.mapper = new ConfigMapper(classType, this.parserFactory);
    const readEnv = this.readEnv();
    this.configData = this.mapper.map(readEnv);
    return this.configData;
  }

  public static getConfig<T>(options: ConfigLoaderOptions): T {
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
}
