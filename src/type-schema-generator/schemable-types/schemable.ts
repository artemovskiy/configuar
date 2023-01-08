import { JSONSchema6 } from 'json-schema';

export interface Schemable {
  getSchema(): JSONSchema6
}
