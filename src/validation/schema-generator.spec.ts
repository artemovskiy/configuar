import { ArrayType, ClassType, LiteralType } from 'typereader';
import { SchemaGenerator } from './schema-generator';
import { ConfigType } from '../metadata/config-type';
import { ConfigSection } from '../metadata/config-section';

class FixtureConfig {
  db: DatabaseConfig;

  port: number;

  queues: string[];

  redis: RedisFixtureConfig;
}

class RedisFixtureConfig {
  host: string;

  port: number;
}

class DatabaseConfig {
  url: string;

  caPath?: string;
}

describe('SchemaGenerator', () => {
  test('should generate a scheme of a flat config', () => {
    const schemaGenerator = new SchemaGenerator(new ConfigType(
      new ClassType(
        [
          { name: 'port', type: new LiteralType(Number), optional: true },
          { name: 'queues', type: new ArrayType(new LiteralType(String)), optional: false },
        ],
        FixtureConfig,
      ),
      [],
    ));

    expect(schemaGenerator.getInputObjectSchema()).toMatchObject({
      type: 'object',
      properties: {
        PORT: {
          type: 'number',
        },
        QUEUES: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['QUEUES'],
    });
  });

  test('should generate a scheme of a complicated config with sections', () => {
    const dbConfigType = new ClassType(
      [
        { name: 'url', type: new LiteralType(String), optional: false },
        { name: 'caPath', type: new LiteralType(String), optional: true },
      ],
      DatabaseConfig,
    );

    const redisConfigType = new ClassType(
      [
        { name: 'host', type: new LiteralType(String), optional: false },
        { name: 'port', type: new LiteralType(Number), optional: false },
      ],
      RedisFixtureConfig,
    );
    const schemaGenerator = new SchemaGenerator(new ConfigType(
      new ClassType(
        [
          { name: 'db', type: dbConfigType, optional: false },
          { name: 'redis', type: redisConfigType, optional: false },
          { name: 'port', type: new LiteralType(Number), optional: true },
          { name: 'queues', type: new ArrayType(new LiteralType(String)), optional: false },
        ],
        FixtureConfig,
      ),
      [
        new ConfigSection('redis', 'REDIS_'),
        new ConfigSection('db', null),
      ],
    ));

    expect(schemaGenerator.getInputObjectSchema()).toEqual({
      type: 'object',
      properties: {
        PORT: {
          type: 'number',
        },
        QUEUES: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        REDIS_HOST: {
          type: 'string',
        },
        REDIS_PORT: {
          type: 'number',
        },
        URL: {
          type: 'string',
        },
        CA_PATH: {
          type: 'string',
        },
      },
      required: ['QUEUES', 'REDIS_HOST', 'REDIS_PORT', 'URL'],
    });
  });
});
