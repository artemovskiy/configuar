import { arrayOf } from 'typereader';
import 'reflect-metadata';

import ConfigMapper from './config-mapper';

import { ConfigLoader } from './config-loader';
import { EnvReaderInterface } from './env-reader';
import { EnvVariable, Section } from './decorator';
import { ConfigSection } from './metadata/config-section';

jest.mock('./config-mapper');

const MockedConfigMapper = (
  jest.requireMock('./config-mapper') as {
    default: jest.MockedClass<typeof ConfigMapper>;
  }
).default;

class StubEnvReader implements EnvReaderInterface {
  constructor(private readonly values: Record<string, string>) {}

  read = jest.fn(() => this.values);
}

class StubConfigMapper {
  getEnvKeys = jest.fn();

  map = jest.fn();
}

class DbConfig {
  @EnvVariable()
  url: string;

  @EnvVariable()
  caPath: string;
}

class ExampleConfig {
  @Section({ prefix: 'DB_' })
  db: DbConfig;

  @EnvVariable()
  port: number;

  @EnvVariable({
    type: arrayOf(String),
  })
  queues: string[];
}

describe('ConfigLoader', () => {
  test('should call reader, then mapper, then validator', () => {
    const envValues = {
      DB_URL: 'mysql://root:123456@localhost:3306',
      DB_CA_PATH: '/my-ca.cert',
      PORT: '3001',
      QUEUES: '["green", "yellow", "red"]',
    };
    const envReader = new StubEnvReader(envValues);
    const configMapper = new StubConfigMapper();
    MockedConfigMapper.mockReturnValueOnce(
      configMapper as unknown as ConfigMapper<ExampleConfig>,
    );

    configMapper.getEnvKeys.mockReturnValue(['dbUrl', 'port', 'queues']);
    configMapper.map.mockReturnValue({
      db: {
        url: 'mysql://root:123456@localhost:3306',
        caPath: '/my-ca.cert',
      },
      port: 3001,
      queues: ['green', 'yellow', 'red'],
    });

    const configLoader = new ConfigLoader({ ctor: ExampleConfig, envReader });
    const result = configLoader.getConfig();
    expect(MockedConfigMapper.mock.calls[0][0].sections).toEqual([new ConfigSection('db', 'DB_')]);
    expect(configMapper.getEnvKeys).toBeCalled();
    expect(configMapper.map).toBeCalledWith(envValues);
    expect(result).toEqual({
      db: {
        url: 'mysql://root:123456@localhost:3306',
        caPath: '/my-ca.cert',
      },
      port: 3001,
      queues: ['green', 'yellow', 'red'],
    });
  });
});
