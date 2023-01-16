import { JSONSchema6 } from 'json-schema';
import { mergeObjectSchemasRight, prefixObjectKeys } from './jsonschema-utils';

describe('jsonschema utils', () => {
  describe('prefixObjectKeys', () => {
    test('should add FOO_ prefix to every object key and required list', () => {
      const originalSchema: JSONSchema6 = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
            },
          },
        },
        required: ['name', 'age'],
      };

      const prefixedSchema = prefixObjectKeys('FOO_', originalSchema);

      expect(prefixedSchema).toEqual({
        type: 'object',
        properties: {
          FOO_name: { type: 'string' },
          FOO_age: { type: 'number' },
          FOO_address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
            },
          },
        },
        required: ['FOO_name', 'FOO_age'],
      });
    });
  });

  describe('mergeObjectSchemasRight', () => {
    test('should merge two object schemas', () => {
      const foo: JSONSchema6 = {
        properties: {
          name: {
            type: 'string',
          },
        },
        required: ['name'],
      };

      const bar: JSONSchema6 = {
        properties: {
          age: {
            type: 'number',
          },
        },
        required: ['age'],
      };

      expect(mergeObjectSchemasRight(foo, bar)).toEqual({
        properties: {
          name: {
            type: 'string',
          },
          age: {
            type: 'number',
          },
        },
        required: ['name', 'age'],
      });
    });
  });
});
