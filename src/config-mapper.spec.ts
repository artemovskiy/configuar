import 'reflect-metadata';
import {
  ArrayType, ClassType, LiteralType,
} from 'typereader';
import ConfigMapper from './config-mapper';
import ParserFactory from './parser-factory';
import { ConfigType } from './metadata/config-type';
import { ConfigSection } from './metadata/config-section';

const defaultCaPath = './ca.pem';

class FixtureConfig {
  db: DatabaseConfig;

  port: number;

  queues: string[];

  redis: RedisFixtureConfig;

  tlsKeyPath?: string;
}

class RedisFixtureConfig {
  host: string;

  port: number;
}

class DatabaseConfig {
  url: string;

  caPath?: string = defaultCaPath;
}

describe('ConfigMapper', () => {
  let configType: ConfigType;
  let redisConfigType: ClassType;
  let dbConfigType: ClassType;
  let mapper: ConfigMapper<FixtureConfig>;

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
          { name: 'tlsKeyPath', type: new LiteralType(String), optional: true },
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

    expect(envKeys).toEqual(['PORT', 'QUEUES', 'TLS_KEY_PATH', 'REDIS_HOST', 'REDIS_PORT', 'URL', 'CA_PATH']);
  });

  test('should map env values to config object', () => {
    const object = mapper.map({
      URL: 'mysql://root:123456@localhost:3306',
      CA_PATH: '/my-root-ca.cert',
      PORT: '3001',
      QUEUES: '["green", "yellow", "red"]',
      REDIS_HOST: 'my-redis',
      REDIS_PORT: '6379',
      TLS_KEY_PATH: '/opt/app/tls/key',
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
    expectedConfig.tlsKeyPath = '/opt/app/tls/key';

    expect(object).toEqual(expectedConfig);
    expect(object).toBeInstanceOf(FixtureConfig);
    expect(object.redis).toBeInstanceOf(RedisFixtureConfig);
  });

  test('should map env values to config object and set default', () => {
    const object = mapper.map({
      URL: 'mysql://root:123456@localhost:3306',
      PORT: '3001',
      QUEUES: '["green", "yellow", "red"]',
      REDIS_HOST: 'my-redis',
      REDIS_PORT: '6379',
    });

    const expectedConfig = new FixtureConfig();
    expectedConfig.db = new DatabaseConfig();
    expectedConfig.db.url = 'mysql://root:123456@localhost:3306';
    expectedConfig.db.caPath = defaultCaPath;
    expectedConfig.port = 3001;
    expectedConfig.queues = ['green', 'yellow', 'red'];
    expectedConfig.redis = new RedisFixtureConfig();
    expectedConfig.redis.host = 'my-redis';
    expectedConfig.redis.port = 6379;

    expect(object).toEqual(expectedConfig);
    expect(object).toBeInstanceOf(FixtureConfig);
    expect(object.redis).toBeInstanceOf(RedisFixtureConfig);
    expect(object.tlsKeyPath).not.toBeDefined();
  });
});
