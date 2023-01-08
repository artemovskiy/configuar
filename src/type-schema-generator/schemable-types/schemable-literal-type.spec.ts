import { SchemableLiteralType } from './schemable-literal-type';

describe('SchemableLiteralType', () => {
  test.each([
    [String, 'string'],
    [Number, 'number'],
    [Boolean, 'boolean'],
  ])('should generate schema of %s literal', (literalCtor, typeName) => {
    const schemable = new SchemableLiteralType(literalCtor);

    expect(schemable.getSchema()).toEqual({ type: typeName });
  });
});
