import { arrayOf, literalType } from 'typereader';
import { SchemableClassType } from './schemable-class-type';
import { SchemableConverter } from './schemable-converter';
import { Schemable } from './schemable';

describe('SchemableClassType', () => {
  test('should generate own schema', () => {
    class Pet {}

    const schemableName: Schemable = {
      getSchema: jest.fn().mockReturnValue({
        type: 'string',
      }),
    };

    const schemableAge: Schemable = {
      getSchema: jest.fn().mockReturnValue({
        type: 'number',
      }),
    };

    const schemableEats: Schemable = {
      getSchema: jest.fn().mockReturnValue({
        type: 'array',
        items: {
          type: 'string',
        },
      }),
    };

    const schemableConverter: SchemableConverter = {
      getSchemableType: jest.fn()
        .mockReturnValueOnce(schemableName)
        .mockReturnValueOnce(schemableAge)
        .mockReturnValueOnce(schemableEats),
    };

    const schemable = new SchemableClassType([
      {
        name: 'name',
        optional: false,
        type: literalType(String),
      },
      {
        name: 'age',
        optional: true,
        type: literalType(Number),
      },
      {
        name: 'eats',
        optional: false,
        type: arrayOf(String),
      },
    ], Pet, schemableConverter);

    expect(schemable.getSchema()).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        eats: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['name', 'eats'],
    });
  });
});
