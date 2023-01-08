import { Type } from 'typereader';
import { JSONSchema6 } from 'json-schema';
import { SchemableConverter } from './schemable-types';

export class TypeSchemaGenerator {
  private readonly schemableConverter: SchemableConverter = new SchemableConverter();

  getSchema(type: Type): JSONSchema6 {
    const schemableType = this.schemableConverter.getSchemableType(type);
    return schemableType.getSchema();
  }
}
