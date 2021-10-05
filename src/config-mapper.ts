import * as JSONSCHEMA from 'json-schema';

import { ParserFactory } from './parser-factory';

export class ConfigMapper {
  private readonly parserFactory: ParserFactory;
  constructor(private readonly schema: JSONSCHEMA.JSONSchema6) {
    this.parserFactory = new ParserFactory();
  }

  map(input: Record<string, string>): unknown {
    const result = {};
    for (const key in this.schema.properties) {
      if (!Object.prototype.hasOwnProperty.call(this.schema.properties, key)) {
        continue;
      }
      const propertySchema = this.schema.properties[key];
      const inputKey = this.getEnvVariableName(key);
      const inputValue = input[inputKey];
      return this.parserFactory
        .createParser(propertySchema as unknown as JSONSCHEMA.JSONSchema6)
        .parse(inputValue);
    }

    return result;
  }

  private getEnvVariableName(key: string) {
    return key
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      .toUpperCase();
  }
}
