import 'reflect-metadata';
import {
  ArrayType, ClassType, LiteralType,
} from 'typereader';
import { ErrorObject } from 'ajv';
import { ConfigType } from '../metadata/config-type';
import { ConfigSection } from '../metadata/config-section';
import { PreparedConfigValidator } from './prepared-config-validator';

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

describe('PreparedConfigValidator', () => {
  let configType: ConfigType;
  let redisConfigType: ClassType;
  let dbConfigType: ClassType;

  beforeEach(() => {
    dbConfigType = new ClassType(
      [
        { name: 'url', type: new LiteralType(String), optional: false },
        { name: 'caPath', type: new LiteralType(String), optional: true },
      ],
      DatabaseConfig,
    );

    redisConfigType = new ClassType(
      [
        { name: 'host', type: new LiteralType(String), optional: false },
        { name: 'port', type: new LiteralType(Number), optional: false },
      ],
      RedisFixtureConfig,
    );

    configType = new ConfigType(
      new ClassType(
        [
          { name: 'db', type: dbConfigType, optional: false },
          { name: 'redis', type: redisConfigType, optional: false },
          { name: 'port', type: new LiteralType(Number), optional: false },
          { name: 'queues', type: new ArrayType(new LiteralType(String)), optional: false },
        ],
        FixtureConfig,
      ),
      [
        new ConfigSection('redis', 'REDIS_'),
        new ConfigSection('db', null),
      ],
    );
  });

  describe('valid config cases', () => {
    test('should return null if config is valid', () => {
      const expectedConfig = new FixtureConfig();
      expectedConfig.db = new DatabaseConfig();
      expectedConfig.db.url = 'mysql://root:123456@localhost:3306';
      expectedConfig.port = 3001;
      expectedConfig.queues = ['green', 'yellow', 'red'];
      expectedConfig.redis = new RedisFixtureConfig();
      expectedConfig.redis.host = 'my-redis';
      expectedConfig.redis.port = 6379;

      const validator = new PreparedConfigValidator(configType, expectedConfig);
      const result = validator.checkValidationErrors();

      expect(result).toBeNull();
    });
  });

  describe('invalid config cases', () => {
    test('should return an error if come field is not defined on the root level', () => {
      const expectedConfig = new FixtureConfig();
      expectedConfig.db = new DatabaseConfig();
      expectedConfig.db.url = 'mysql://root:123456@localhost:3306';
      // expectedConfig.port = 3001; missing
      expectedConfig.queues = ['green', 'yellow', 'red'];
      expectedConfig.redis = new RedisFixtureConfig();
      expectedConfig.redis.host = 'my-redis';
      expectedConfig.redis.port = 6379;

      const validator = new PreparedConfigValidator(configType, expectedConfig);
      const result = validator.checkValidationErrors();

      expect(result).toEqual([
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'port'",
          params: {
            missingProperty: 'port',
          },
          schemaPath: '#/required',
        },
      ] as ErrorObject[]);
    });

    test('should return an error if come field is not defined in a section', () => {
      const expectedConfig = new FixtureConfig();
      expectedConfig.db = new DatabaseConfig();
      // expectedConfig.db.url = 'mysql://root:123456@localhost:3306'; missing
      expectedConfig.db.caPath = '/my-root-ca.cert';
      expectedConfig.port = 3001;
      expectedConfig.queues = ['green', 'yellow', 'red'];
      expectedConfig.redis = new RedisFixtureConfig();
      expectedConfig.redis.host = 'my-redis';
      expectedConfig.redis.port = 6379;

      const validator = new PreparedConfigValidator(configType, expectedConfig);
      const result = validator.checkValidationErrors();

      expect(result).toEqual([
        {
          instancePath: '/db',
          keyword: 'required',
          message: "must have required property 'url'",
          params: {
            missingProperty: 'url',
          },
          schemaPath: '#/properties/db/required',
        },
      ] as ErrorObject[]);
    });
  });
});
