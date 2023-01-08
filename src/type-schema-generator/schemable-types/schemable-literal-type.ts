import { LiteralType } from 'typereader';
import { JSONSchema6, JSONSchema6TypeName } from 'json-schema';
import { LiteralConstructor } from 'typereader/dist/literal/literal-type';
import { Schemable } from './schemable';

const constructorToTypeName = new Map<LiteralConstructor, JSONSchema6TypeName>();
constructorToTypeName.set(String, 'string');
constructorToTypeName.set(Number, 'number');
constructorToTypeName.set(Boolean, 'boolean');

export class SchemableLiteralType extends LiteralType implements Schemable {
  getSchema(): JSONSchema6 {
    const typeName = constructorToTypeName.get(this.getConstructorReference());
    if (!typeName) {
      throw new TypeError(`Noy found type name for constructor: ${this.getConstructorReference()}`);
    }
    return {
      type: typeName,
    };
  }
}
