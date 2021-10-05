import * as JSONSCHEMA from 'json-schema';

import { ArrayParser, NumberParser, StringParser, Parser } from './parser';

export class ParserFactory {
  createParser<T>(schema: JSONSCHEMA.JSONSchema6): Parser<T> {
    switch (schema?.type) {
      case 'array':
        return this.createArrayParse(schema) as unknown as Parser<T>;
      case 'integer':
      case 'number':
        return this.createNumberParser() as unknown as Parser<T>;
      case 'string':
      default:
        return this.createStringParser(schema) as unknown as Parser<T>;
    }
  }

  private createNumberParser() {
    return new NumberParser();
  }

  private createArrayParse<I>(schema: JSONSCHEMA.JSONSchema6): ArrayParser<I> {
    if (Array.isArray(schema.items)) {
      throw new SyntaxError('not supported');
    }
    const itemParser: Parser<I> = this.createParser(
      schema.items as JSONSCHEMA.JSONSchema6,
    );
    return new ArrayParser<I>(itemParser);
  }

  private createStringParser(schema: JSONSCHEMA.JSONSchema6): StringParser {
    return new StringParser();
  }
}
