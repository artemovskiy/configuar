import { ConfigLoader, EnvReader, FileEnvReader } from '../src';
import * as mockFs from 'mock-fs';

describe('E2E: ConfigLoader', () => {
  beforeAll(() => {
    mockFs({
      'config-schema.yaml': `type: object
properties:
  host:
    type: string
  port:
    type: number
  listenQueues:
    type: array
    items:
      type: string
required:
  - host
  - listenQueues
`,
      '.env': `HOST=host string value
PORT=3500
LISTEN_QUEUES=[queue1, queue2]
`,
      '.env2': `HOST=host string value`,
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('config should have all values from .env file', async () => {
    const config = new ConfigLoader().getConfig() as any;
    expect(config.host).toBe('host string value');
    expect(config.port).toBe(3500);
    expect(config.listenQueues).toStrictEqual(['queue1', 'queue2']);
  });

  test('ConfigLoader should print validation errors and keep keys', async () => {
    const fileEnvReader = new FileEnvReader({
      filename: '.env2',
    });
    const envReader = new EnvReader(fileEnvReader);

    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    const reader = new ConfigLoader({ envReader }).getConfig() as any;
    expect(consoleLogSpy).toBeCalledTimes(1);

    expect(reader.host).toBe('host string value');
    expect(reader.port).toBe(NaN);
    expect(reader.listenQueues).toBe(null);
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
