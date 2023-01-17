# Type-safe configuration loader for TypeScript

This package helps you:
* define you app config type using classes&decorators
* validate the config according to class property types
* read config values from environment and other sources like .env files
* automatically generate documentation about the app config

## How to use
1. Install
`yarn add configuar`
2. Define your application config
```typescript
import { EnvVariable } from 'configuar';

export default class AppConfig {
  @EnvVariable()
  port: number;

  @EnvVariable()
  dbUrl: string;
}
```
3. Define the environment using variables or `.env` file
```
// .env
PORT=3001
DB_URL=postgres://localhost:5234/postgres
```
4. Read the configuration
```typescript
const config = ConfigLoader.getConfig<AppConfig>({ ctor: AppConfig });
/* AppConfig {
  port: 3001,
  dbUrl: `postgres://localhost:5234/postgres`
} */
```

`getConfig` throws a validation error, if there are missing variables or wrong value types.
5. Create config schema to share it with your colleagues
```shell
npx configuar get-schema ./dist/app-config.ts
```
You will get:

```json
{
  "type": "object",
  "properties": {
    "PORT": {
      "type": "number"
    },
    "DB_URL": {
      "type": "string"
    }
  },
  "required": ["PORT", "DB_URL"]
}
```

Put the schema to README.md to explain your colleagues which env variables are required to run the application.

This was just a basic example. You can [define nested config objects, use optional params](docs/config-class.md) and [use it within a Nestjs
application](docs/nest.md).

## Docs

- [Writing config class](docs/config-class.md)
- [Reference](docs/reference.md)
- [Usage with Nestjs](docs/nest.md)

## Further plans

1. Advanced validation: check value formats like Urls, integers etc
2. More decorator options
3. Flexible config schema generator: add human readable config docs generator



