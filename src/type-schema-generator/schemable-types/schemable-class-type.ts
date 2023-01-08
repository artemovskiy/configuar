import { ClassType, ClassProperty } from 'typereader';
import { JSONSchema6 } from 'json-schema';
import { Constructor } from 'typereader/dist/types';
// eslint-disable-next-line import/no-cycle
import { SchemableConverter } from './schemable-converter';
import { Schemable } from './schemable';

export class SchemableClassType extends ClassType implements Schemable {
  constructor(
    properties: ClassProperty[],
    reference: Constructor<unknown>,
    private readonly schemableConverter: SchemableConverter,
  ) {
    super(properties, reference);
  }

  getSchema(): JSONSchema6 {
    const schema: JSONSchema6 = {
      type: 'object',
      properties: {},
      required: [],
    };
    for (const propery of this.getProperties()) {
      if (typeof propery.name === 'string') {
        schema.properties[propery.name] = this.schemableConverter.getSchemableType(propery.type).getSchema();
        if (!propery.optional) {
          schema.required.push(propery.name);
        }
      }
    }

    return schema;
  }
}
