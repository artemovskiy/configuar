import 'reflect-metadata';
import {
  ArrayType, ClassProperty, ClassType, LiteralType,
} from 'typereader';
import ConfigMapper from './config-mapper';
import ParserFactory from './parser-factory';
import { ConfigType } from './metadata/config-type';
import { ConfigSection } from './metadata/config-section';

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

describe('ConfigMapper', () => {
  let configType: ConfigType;
  let redisConfigType: ClassType;
  let dbConfigType: ClassType;
  let mapper: ConfigMapper<FixtureConfig>;

  beforeEach(() => {
    dbConfigType = new ClassType(
      [
        new ClassProperty('url', new LiteralType(String), false),
        new ClassProperty('caPath', new LiteralType(String), true),
      ],
      DatabaseConfig,
    );

    redisConfigType = new ClassType(
      [
        new ClassProperty('host', new LiteralType(String), false),
        new ClassProperty('port', new LiteralType(Number), false),
      ],
      RedisFixtureConfig,
    );

    configType = new ConfigType(
      new ClassType(
        [
          new ClassProperty('db', dbConfigType, false),
          new ClassProperty('redis', redisConfigType, false),
          new ClassProperty('port', new LiteralType(Number), false),
          new ClassProperty('queues', new ArrayType(new LiteralType(String)), false),
        ],
        FixtureConfig,
      ),
      [
        new ConfigSection('redis', 'REDIS_'),
        new ConfigSection('db', null),
      ],
    );

    mapper = new ConfigMapper(configType, new ParserFactory());
  });

  test('should get env keys', () => {
    const envKeys = mapper.getEnvKeys();

    expect(envKeys).toEqual(['PORT', 'QUEUES', 'REDIS_HOST', 'REDIS_PORT', 'URL', 'CA_PATH']);
  });

  test('should map env values to config object', () => {
    const object = mapper.map({
      URL: 'mysql://root:123456@localhost:3306',
      CA_PATH: '/my-root-ca.cert',
      PORT: '3001',
      QUEUES: '["green", "yellow", "red"]',
      REDIS_HOST: 'my-redis',
      REDIS_PORT: '6379',
    });

    const expectedConfig = new FixtureConfig();
    expectedConfig.db = new DatabaseConfig();
    expectedConfig.db.url = 'mysql://root:123456@localhost:3306';
    expectedConfig.db.caPath = '/my-root-ca.cert';
    expectedConfig.port = 3001;
    expectedConfig.queues = ['green', 'yellow', 'red'];
    expectedConfig.redis = new RedisFixtureConfig();
    expectedConfig.redis.host = 'my-redis';
    expectedConfig.redis.port = 6379;

    expect(object).toEqual(expectedConfig);
    expect(object).toBeInstanceOf(FixtureConfig);
    expect(object.redis).toBeInstanceOf(RedisFixtureConfig);
  });
});
