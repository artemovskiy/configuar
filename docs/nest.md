# Configuar & Nestjs

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

