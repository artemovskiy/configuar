/* eslint-disable max-classes-per-file */
import { arrayOf } from 'typereader';
import { EnvVariable, Section } from '../../dist';

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

class RedisConfig {
  @EnvVariable()
  url: string;
}

export default class ExampleConfig {
  @EnvVariable({ optional: true })
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

  @Section({ prefix: 'REDIS_', optional: true })
  redis: RedisConfig;
}
