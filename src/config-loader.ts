import { MetadataStorage, TypeExplorer } from 'typereader';
import ConfigMapper from './config-mapper';
import { EnvReader, EnvReaderInterface, FileEnvReader } from './env-reader';
import { ParserFactory as ParserFactoryInterface } from './parser-factory.interface';
import ParserFactory from './parser-factory';
import { ConfigType } from './metadata/config-type';
import { ConfigMetadataStorage } from './metadata/metadata-storage';
import { ConfigSection } from './metadata/config-section';
import { PreparedConfigValidator } from './validation/prepared-config-validator';
import { InvalidConfigException } from './invalid-config-exception';
import { ErrorTranslator } from './validation/error-translator';

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
    this.mapper = new ConfigMapper(this.getConfigType(), this.parserFactory);
    const readEnv = this.readEnv();
    this.configData = this.mapper.map(readEnv);
    this.validateConfig();
    return this.configData;
  }

  private validateConfig() {
    const validator = new PreparedConfigValidator(
      this.getConfigType(),
      this.configData,
    );

    const validationResult = validator.checkValidationErrors();
    if (validationResult) {
      const translator = new ErrorTranslator(this.getConfigType());
      throw new InvalidConfigException(validationResult.map((i) => translator.translate(i)));
    }
  }

  public getConfigType(): ConfigType {
    const classType = this.typeExplorer.getClassType(this.ctor);
    const metadata = ConfigMetadataStorage.instance().getConfigClassMetadata(this.ctor.prototype);
    const sections: ConfigSection[] = [];
    const metadataSections = metadata.getSections();
    for (const key of Object.keys(metadataSections)) {
      const sectionData = metadataSections[key];
      sections.push(new ConfigSection(key, sectionData.prefix));
    }
    return new ConfigType(classType, sections);
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
