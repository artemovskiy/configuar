import * as mockFs from 'mock-fs';
import 'reflect-metadata';
import { arrayOf } from 'typereader';
import { ConfigLoader, EnvReader, FileEnvReader } from '../src';
import { EnvVariable } from '../src/decorator';

class ExampleConfig {
  @EnvVariable()
  host: string;

  @EnvVariable()
  port: number;

  @EnvVariable()
  https: boolean;

  @EnvVariable({ type: arrayOf(String) })
  listenQueues: string[];
}

describe('E2E: ConfigLoader', () => {
  beforeAll(() => {
    mockFs({
      '.env': `HOST=host string value
PORT=3500
LISTEN_QUEUES=[queue1, queue2]
HTTPS=true
`,
      '.env2': 'HOST=host string value',
      '.env3': '',
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
    mockFs.restore();
  });

  test('config should have all values from .env file', async () => {
    const config = ConfigLoader.getConfig<ExampleConfig>({ ctor: ExampleConfig });
    expect(config.host).toBe('host string value');
    expect(config.port).toBe(3500);
    expect(config.listenQueues).toStrictEqual(['queue1', 'queue2']);
    expect(config.https).toStrictEqual(true);
  });

  test('config should add values from process.env', async () => {
    // process.env.PORT = '3500'; // not set because port is not required
    process.env.LISTEN_QUEUES = '[queue1, queue2]';

    const fileEnvReader = new FileEnvReader({
      filename: '.env2',
    });
    const envReader = new EnvReader(fileEnvReader);
    const reader = ConfigLoader.getConfig({ envReader, ctor: ExampleConfig }) as any;

    expect(reader).toEqual({
      host: 'host string value',
      listenQueues: ['queue1', 'queue2'],
      https: null,
      port: NaN,
    });
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
