import { arrayOf } from 'typereader';
import 'reflect-metadata';

import ConfigMapper from './config-mapper';

import { ConfigLoader } from './config-loader';
import { EnvReaderInterface } from './env-reader';
import { EnvVariable } from './decorator';

jest.mock('./config-mapper');

const MockerConfigMapper = (
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

class ExampleConfig {
  @EnvVariable()
  dbUrl: string;

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
      PORT: '3001',
      QUEUES: '["green", "yellow", "red"]',
    };
    const envReader = new StubEnvReader(envValues);
    const configMapper = new StubConfigMapper();
    MockerConfigMapper.mockReturnValueOnce(
      configMapper as unknown as ConfigMapper<ExampleConfig>,
    );

    configMapper.getEnvKeys.mockReturnValue(['dbUrl', 'port', 'queues']);
    configMapper.map.mockReturnValue({
      dbUrl: 'mysql://root:123456@localhost:3306',
      port: 3001,
      queues: ['green', 'yellow', 'red'],
    });

    const configLoader = new ConfigLoader({ ctor: ExampleConfig, envReader });
    const result = configLoader.getConfig();

    expect(configMapper.getEnvKeys).toBeCalled();
    expect(configMapper.map).toBeCalledWith(envValues);
    expect(result).toEqual({
      dbUrl: 'mysql://root:123456@localhost:3306',
      port: 3001,
      queues: ['green', 'yellow', 'red'],
    });
  });
});
