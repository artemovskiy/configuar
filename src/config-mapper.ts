import * as JSONSCHEMA from 'json-schema';

import { ParserFactory } from './parser-factory.interface';
import { mapObjIndexed } from './utils';

export class ConfigMapper {
  constructor(
    private readonly schema: JSONSCHEMA.JSONSchema6,
    private readonly parserFactory: ParserFactory,
  ) {}

  getEnvKeys() {
    return Object.keys(this.schema.properties).map((key) =>
      this.getEnvVariableName(key),
    );
  }

  map(input: Record<string, string>): unknown {
    return mapObjIndexed((propertySchema, key) => {
      const inputKey = this.getEnvVariableName(key);
      const inputValue = input[inputKey];
      const parser = this.parserFactory.createParser(
        propertySchema as unknown as JSONSCHEMA.JSONSchema6,
      );
      return parser.parse(inputValue);
    }, this.schema.properties);
  }

  private getEnvVariableName(key: string) {
    return key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase();
  }
}
