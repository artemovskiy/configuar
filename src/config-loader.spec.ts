import { arrayOf } from 'typereader';
import 'reflect-metadata';

import { ErrorObject } from 'ajv/dist/ajv';
import ConfigMapper from './config-mapper';
import { PreparedConfigValidator } from './validation/prepared-config-validator';

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

jest.mock('./validation/prepared-config-validator');

const MockedConfigValidator = (
  jest.requireMock('./validation/prepared-config-validator') as {
    PreparedConfigValidator: jest.MockedClass<typeof PreparedConfigValidator>;
  }
).PreparedConfigValidator;

class StubEnvReader implements EnvReaderInterface {
  constructor(private readonly values: Record<string, string>) {}

  read = jest.fn(() => this.values);
}

class StubConfigMapper {
  getEnvKeys = jest.fn();

  map = jest.fn();
}

class StubConfigValidator {
  checkValidationErrors = jest.fn();
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

    const stubConfigValidator = new StubConfigValidator();
    MockedConfigValidator.mockReturnValue(
      stubConfigValidator as unknown as PreparedConfigValidator,
    );
    stubConfigValidator.checkValidationErrors.mockReturnValueOnce(null);

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
    expect(stubConfigValidator.checkValidationErrors).toBeCalled();
  });

  test('should throw an error if validation found some errors', () => {
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

    const stubConfigValidator = new StubConfigValidator();
    MockedConfigValidator.mockReturnValue(
      stubConfigValidator as unknown as PreparedConfigValidator,
    );
    stubConfigValidator.checkValidationErrors.mockReturnValueOnce([
      {
        keyword: 'required',
        instancePath: '/',
      },
    ] as ErrorObject[]);

    configMapper.getEnvKeys.mockReturnValue(['dbUrl', 'port', 'queues']);
    configMapper.map.mockReturnValue({
      db: {
        url: 'mysql://root:123456@localhost:3306',
        caPath: '/my-ca.cert',
      },
      queues: ['green', 'yellow', 'red'],
    });

    const configLoader = new ConfigLoader({ ctor: ExampleConfig, envReader });
    expect(() => configLoader.getConfig()).toThrow();
  });
});
