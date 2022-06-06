# Framework agnostic declarative configuration
This package helps a developer to:
* define the config type in a declarative way
* read config values from environment and other source like .env
* validate env variables(soon)
* automatically document required env variables(soon)
### Example
```typescript
import { EnvVariable, ArrayOf } from 'configuar';

export default class AppConfig {
  @EnvVariable()
  serverPort: number;

  @EnvVariable()
  serverHost: string;

  @EnvVariable({
    type: ArrayOf(String)
  })
  userBlacklist: string[];
}
/* Environment
SERVER_PORT=3000
SERVER_HOST=localhost
USER_BLACKLIST=['Alice', 'Bob']
 */

const config = ConfigLoader.getConfig<AppConfig>({ ctor: AppConfig });
/* {
  serverPort: 3000,
  serverHost: 'localhost',
  userBlacklist: ['Alise', 'Bob'],
} */
```

### Decorators

#### EnvVariable(options?: Options)
Decorator for config field which should be read from environment.
##### Options
* type (optional) - where the Configuar can get type automatically it does it, but TypeScript does not support 
reflection for complex types like arrays. So for complex types you should explicitly define env variable type by 
this option. Also, if you want, you may set type for primitive types, like strings, too.

### API
#### ConfigLoader
##### ConfigLoader.getConfig<TConfig>(options)
Reads config by the default env reader ot either the explicitly passed one. Returns the
read object.
###### ctor
The configuration class constructor
###### envReader (optional)
You may replace the default config reader if you want some custom behaviour.
The default reader collect env variables from the environment and if a variable does not set also
looks into `.env` file in CWD.

### Nest
Since Configuar uses classes for config schema definition, you simply inject you config via Nest DI.
#### Example
```typescript
// src/config.module.ts
import { ConfigLoader } from 'configuar';
import { Module } from '@nestjs/common';
import AppConfig from './app-config';

@Module({
  providers: [
    {
      provide: AppConfig,
      useValue: ConfigLoader.getConfig<AppConfig>({ ctor: AppConfig }),
    },
  ],
  exports: [AppConfig],
})
export default class ConfigModule {}

// src/app.service.ts
import { Injectable } from '@nestjs/common';
import AppConfig from './app-config';

@Injectable()
export default class AppService {
  constructor(
    private readonly appConfig: AppConfig,
  ) {
    console.log(`these users are black-listed: ${this.appConfig.userBlacklist.join(', ')}`)
  }
}

```


