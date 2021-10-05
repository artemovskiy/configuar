import { JSONSchema6 } from 'json-schema';
import { validate } from 'jsonschema';

import { ConfigMapper } from './config-mapper';
import {EnvReader, EnvReaderInterface, FileEnvReader} from "./env-reader";
import {SchemaReaderInterface} from "./schema-reader/schema-reader.interface";
import {FileSchemaReader} from "./schema-reader/file-schema-reader";

export type ConfigLoaderOptions = {
  envReader?: EnvReaderInterface,
  schemaReader?: SchemaReaderInterface,
}

export class ConfigLoader {

  private configSchema: JSONSchema6;
  private configData: any;
  private envReader: EnvReaderInterface;
  private schemaReader: SchemaReaderInterface;

  constructor(options?: ConfigLoaderOptions) {
    this.envReader = options?.envReader ?? this.createDefaultEnvReader();
    this.schemaReader = options?.schemaReader ?? this.createDefaultSchemaReader();
  }

  getConfig() {
    this.configSchema = this.schemaReader.read();
    this.configData = this.mapConfigData(this.readEnv());
    this.validate();
    return this.configData;
  }

  public static getConfig(options?: ConfigLoaderOptions) {
    const configLoader = new ConfigLoader(options);
    return configLoader.getConfig();
  }

  private readEnv(): Record<string, string> {
    return this.envReader.read(Object.keys(this.configSchema.properties));
  }

  private mapConfigData(values: Record<string, string>) {
    const mapper = new ConfigMapper(this.configSchema);
    return mapper.map(values);
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
