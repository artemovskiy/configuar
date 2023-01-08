import { arrayOf, ClassType, literalType } from 'typereader';
import { TypeSchemaGenerator } from './type-schema-generator';

describe('TypeSchemaGenerator', () => {
  test('should generate schema of an class', () => {
    class Person {}

    const personType = new ClassType([
      {
        name: 'name',
        optional: false,
        type: literalType(String),
      },
      {
        name: 'address',
        optional: true,
        type: literalType(String),
      },
    ], Person);

    class Pet {}
    const petType = new ClassType([
      {
        name: 'name',
        optional: false,
        type: literalType(String),
      },
      {
        name: 'owner',
        optional: false,
        type: personType,
      },
      {
        name: 'eats',
        optional: false,
        type: arrayOf(String),
      },
    ], Pet);

    const generator = new TypeSchemaGenerator();

    expect(generator.getSchema(petType)).toEqual({
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        owner: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            address: {
              type: 'string',
            },
          },
          required: ['name'],
        },
        eats: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['name', 'owner', 'eats'],
    });
  });
});
