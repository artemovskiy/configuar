import { ParserFactory } from './parser-factory.interface';
import { mapObjIndexed } from './utils';
import {Schema} from "./schema";

export class ConfigMapper<TConfig> {
  constructor(
    private readonly schema: Schema<TConfig>,
    private readonly parserFactory: ParserFactory,
  ) {}

  getEnvKeys() {
    return Object.keys(this.schema).map((key) =>
      this.getEnvVariableName(key),
    );
  }

  map(input: Record<string, string>): TConfig {
    return mapObjIndexed((propertySchema, key) => {
      const inputKey = this.getEnvVariableName(key);
      const inputValue = input[inputKey];
      const parser = this.parserFactory.createParser(
        propertySchema.ctor,
      );
      return parser.parse(inputValue);
    }, this.schema) as TConfig;
  }

  private getEnvVariableName(key: string) {
    return key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase();
  }
}
