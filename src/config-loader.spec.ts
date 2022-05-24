import { ConfigMapper } from './config-mapper';

jest.mock('./config-mapper');

const MockerConfigMapper = (
  jest.requireMock('./config-mapper') as {
    ConfigMapper: jest.MockedClass<typeof ConfigMapper>;
  }
).ConfigMapper;

import { ConfigLoader } from './config-loader';
import { EnvReaderInterface } from './env-reader';
import {Schema, SchemaReaderInterface, EnvVariable, ArrayOf, Constructor} from './schema';

class StubSchemaReader<T> implements SchemaReaderInterface {
  constructor(private readonly schema: Schema<any>) {}
  read = jest.fn(() => this.schema);
}

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
  dbUrl: string
  @EnvVariable()
  port: number;
  @EnvVariable({
    type: ArrayOf(String),
  })
  queues: string[]
}

describe('ConfigLoader', () => {
  test('should call reader, then mapper, then validator', () => {
    const schema: Schema<ExampleConfig> = {
        dbUrl: {
          ctor: String,
        },
        port: {
          ctor: Number,
        },
        queues: {
         ctor: ArrayOf(String)
        },
    };
    const schemaReader = new StubSchemaReader(schema);
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

    const configLoader = new ConfigLoader({ schemaReader, envReader });
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
