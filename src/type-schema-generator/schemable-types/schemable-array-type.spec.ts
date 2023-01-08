import { arrayOf, ClassType, literalType } from 'typereader';
import { SchemableConverter } from './schemable-converter';
import { Schemable } from './schemable';
import { SchemableArrayType } from './schemable-array-type';

describe('SchemableArrayType', () => {
  test('should generate schema of objects array', () => {
    class Pet {}

    const elementSchema = {
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
    };
    const schemableElement: Schemable = {
      getSchema: jest.fn().mockReturnValue(elementSchema),
    };

    const petType = new ClassType([
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
    ], Pet);

    const schemableConverter: SchemableConverter = {
      getSchemableType: jest.fn()
        .mockReturnValueOnce(schemableElement),
    };

    const schemable = new SchemableArrayType(petType, schemableConverter);

    expect(schemable.getSchema()).toEqual({
      type: 'array',
      items: elementSchema,
    });
  });

  test('should generate schema of literals array', () => {
    const elementSchema = { type: 'string' };
    const schemableElement: Schemable = {
      getSchema: jest.fn().mockReturnValue(elementSchema),
    };

    const schemableConverter: SchemableConverter = {
      getSchemableType: jest.fn()
        .mockReturnValueOnce(schemableElement),
    };

    const schemable = new SchemableArrayType(literalType(String), schemableConverter);

    expect(schemable.getSchema()).toEqual({
      type: 'array',
      items: elementSchema,
    });
  });
});
