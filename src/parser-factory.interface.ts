import * as JSONSCHEMA from 'json-schema';

import { Parser } from './parser';

export interface ParserFactory {
  createParser<T>(schema: JSONSCHEMA.JSONSchema6): Parser<T>;
}
