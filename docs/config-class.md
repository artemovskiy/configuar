# How to define your app config

## Basic

The simplest config consists of a class with at least one config property. The
property has to be decorated with `EnvVariable` decorator, because TypeScript native
reflection can not list class properties.
```typescript
import { EnvVariable } from 'configuar';

export default class AppConfig {
  @EnvVariable()
  dbUrl: string;
}
```
The property name must be in _camelCase_. While reading config from an environment
or a `.env` file the property name will be converted to _UPPER_SNAKE_CASE_. For example,
the config above will read `dbUrl` from `DB_URL` variable.

## Array values
Configuar can read not only literal values, it also supports arrays. To read array you should
explicitly specify the type:
```typescript
import { EnvVariable } from 'configuar';
import { arrayOf } from 'typereader'; // typereader is a dependency of configuar

export default class AppConfig {
  @EnvVariable({
    type: arrayOf(String),
  })
  rootUsers: string[];
}
```
Define root users:
```
export ROOT_USERS=['Alice','Bob']
```
You will get this:
```typescript
AppConfig {
  rootUsers: ["Alice", "Bob"]
}
```

## Sections

When you work on a large project the config definition grows more and more, becomes
overloaded and messy. To avoid this undesired occasion configuar offers you 
"divide et impera" solution: split your big config into small sections.

At first, define small sections:

```typescript
import { EnvVariable } from 'configuar';

export class RedisConfig {
  @EnvVariable()
  host: string;
  @EnvVariable()
  port: number;
}
```
```typescript
import { EnvVariable } from 'configuar';

export class PostgresConfig {
  @EnvVariable()
  useSsl: boolean;
  @EnvVariable()
  url: string;
}
```
Compile the app config of created small sections:
```typescript
import { Section } from 'configuar';

export class AppConfig {
  @Section({ prefix: 'POSTGRES_'})
  postgres: PostgresConfig;

  @Section({ prefix: 'REDIS_'})
  redis: RedisConfig;
}
```

Provide config like that:
```
POSTGRES_URL=postgres://localhost:5234
POSTGRES_USE_SSL=false

REDIS_HOST=localhost
REDIS_PORT=6739
```

If you omit `prefix` param in `Section` decorator section variables will be treated without
any prefix:
```typescript
import { Section } from 'configuar';

export class AppConfig {
  @Section()
  postgres: PostgresConfig;
  /**
   * Expects:
   * URL=postgres://localhost:5234
   * USE_SSL=false
   */
}
```
