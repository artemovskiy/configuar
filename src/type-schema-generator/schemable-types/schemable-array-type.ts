import { ArrayType } from 'typereader';
import { Type } from 'typereader/dist/type/type';
import { JSONSchema6 } from 'json-schema';
import { Schemable } from './schemable';
// eslint-disable-next-line import/no-cycle
import { SchemableConverter } from './schemable-converter';

export class SchemableArrayType extends ArrayType implements Schemable {
  constructor(
    elementType: Type,
    private readonly schemableConverter: SchemableConverter,
  ) {
    super(elementType);
  }

  getSchema(): JSONSchema6 {
    return {
      type: 'array',
      items: this.schemableConverter.getSchemableType(this.getElementType()).getSchema(),
    };
  }
}
