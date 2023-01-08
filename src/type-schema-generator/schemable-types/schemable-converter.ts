import { Type, TypeKind } from 'typereader';
import { Schemable } from './schemable';
import { SchemableLiteralType } from './schemable-literal-type';
// eslint-disable-next-line import/no-cycle
import { SchemableClassType } from './schemable-class-type';
// eslint-disable-next-line import/no-cycle
import { SchemableArrayType } from './schemable-array-type';

type SchemableFactory = (originalType: Type, schemableConverter: SchemableConverter) => Schemable;

const schemableConstructors: {
  [P in TypeKind]?: SchemableFactory
} = {
  [TypeKind.LiteralType]: (type) => new SchemableLiteralType(type.as(TypeKind.LiteralType).getConstructorReference()),
  [TypeKind.Class]: (type, converter) => {
    const classType = type.as(TypeKind.Class);
    return new SchemableClassType(classType.getProperties(), classType.getConstructorReference(), converter);
  },
  [TypeKind.Array]: (type, converter) => {
    const arrayType = type.as(TypeKind.Array);
    return new SchemableArrayType(arrayType.getElementType(), converter);
  },
};

export class SchemableConverter {
  getSchemableType<T extends Type>(type: T): T & Schemable {
    const matchingTypeFactory = schemableConstructors[type.getKind()];
    if (!matchingTypeFactory) {
      throw new TypeError(`Unexpected type kind: ${type.getKind()}`);
    }
    return matchingTypeFactory(type, this) as T & Schemable;
  }
}
