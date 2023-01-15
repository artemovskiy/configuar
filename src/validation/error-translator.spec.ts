import 'reflect-metadata';
import {
  ArrayType, ClassType, LiteralType,
} from 'typereader';
import { ConfigType } from '../metadata/config-type';
import { ConfigSection } from '../metadata/config-section';
import { ErrorTranslator, ValidationError } from './error-translator';

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

describe('ErrorTranslator', () => {
  let configType: ConfigType;
  let redisConfigType: ClassType;
  let dbConfigType: ClassType;
  let translator: ErrorTranslator;

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

    translator = new ErrorTranslator(configType);
  });

  test('should translate root level property error', () => {
    const original = {
      instancePath: '',
      keyword: 'required',
      message: "must have required property 'port'",
      params: {
        missingProperty: 'port',
      },
      schemaPath: '#/required',
    };

    const actual = translator.translate(original);

    expect(actual).toEqual({
      envKey: 'PORT',
      keyword: 'required',
      message: '\'PORT\' has to be defined',
    } as ValidationError);
  });

  test('should translate level 1 section property error', () => {
    const original = {
      instancePath: '/redis',
      keyword: 'required',
      message: "must have required property 'host'",
      params: {
        missingProperty: 'host',
      },
      schemaPath: '#/properties/redis/required',
    };

    const actual = translator.translate(original);

    expect(actual).toEqual({
      envKey: 'REDIS_HOST',
      keyword: 'required',
      message: '\'REDIS_HOST\' has to be defined',
    } as ValidationError);
  });
});
