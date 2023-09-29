import * as mockFs from 'mock-fs';
import 'reflect-metadata';
import { arrayOf, Property } from 'typereader';
import {
  ConfigLoader, EnvReader, FileEnvReader, Section, EnvVariable,
} from '../src';

class DbConfig {
  @EnvVariable()
  name: string;

  @EnvVariable()
  port: number;
}

class ServerConfig {
  @EnvVariable()
  host: string;
}

class ExampleConfig {
  @Property({ optional: true })
  @EnvVariable()
  port: number = 3001;

  @EnvVariable()
  https: boolean;

  @EnvVariable({ optional: true })
  tlsKeyPath?: string;

  @EnvVariable({ type: arrayOf(String) })
  listenQueues: string[];

  @Section({ prefix: 'DATABASE_' })
  db: DbConfig;

  @Section()
  server: ServerConfig;
}

describe('E2E: ConfigLoader', () => {
  beforeAll(() => {
    mockFs({
      '.env': `HOST=host string value
PORT=3500
LISTEN_QUEUES=[queue1, queue2]
HTTPS=true
DATABASE_NAME=postgres
DATABASE_PORT=3306
TLS_KEY_PATH=/opt/app/tls/key
`,
      '.env2': `
HOST=host string value
HTTPS=false
`,
      '.env3': '',
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    mockFs.restore();
  });

  test('config should have all values from .env file', async () => {
    const config = ConfigLoader.getConfig<ExampleConfig>({ ctor: ExampleConfig });
    expect(config.server.host).toBe('host string value');
    expect(config.port).toBe(3500);
    expect(config.listenQueues).toStrictEqual(['queue1', 'queue2']);
    expect(config.https).toStrictEqual(true);
    expect(config.tlsKeyPath).toBe('/opt/app/tls/key');
    expect(config.db).toEqual({
      name: 'postgres',
      port: 3306,
    });
  });

  test('config should add values from process.env', async () => {
    // process.env.PORT = '3500'; // not set because port is not required
    process.env.LISTEN_QUEUES = '[queue1, queue2]';
    process.env.DATABASE_NAME = 'postgres';
    process.env.DATABASE_PORT = '3306';

    const fileEnvReader = new FileEnvReader({
      filename: '.env2',
    });
    const envReader = new EnvReader(fileEnvReader);
    const config = ConfigLoader.getConfig({ envReader, ctor: ExampleConfig }) as any;

    expect(config.tlsKeyPath).not.toBeDefined();
    expect(config).toMatchObject({
      server: {
        host: 'host string value',
      },
      port: 3001,
      listenQueues: ['queue1', 'queue2'],
      https: false,
      db: {
        name: 'postgres',
        port: 3306,
      },
    });
  });

  test('should throw if no required actions provided', async () => {
    const fileEnvReader = new FileEnvReader({
      filename: '.env3',
    });
    const envReader = new EnvReader(fileEnvReader);

    expect(() => ConfigLoader.getConfig({ envReader, ctor: ExampleConfig })).toThrow();
  });

  let processEnv;

  beforeEach(() => {
    processEnv = process.env;
    process.env = {};
  });

  afterEach(() => {
    process.env = processEnv;
  });
});
