## Decorators

#### EnvVariable(options?: Options)
Decorator for config field which should be read from environment.
##### Options
* type (optional) - where Configuar can get type automatically it does, but TypeScript does not support
  reflection for complex types like arrays. So for complex types you should explicitly define env variable type by
  this option. Also, if you want, you may set type for primitive types, like strings, too.

* optional (optional, default: `false`) - set `true` to make the filed optional. Optional fields are not required to have a config value 

#### Section(options?: SectionOptions)
Set a field contains group of nested config params(section)

##### SectionOptions
* prefix (optional) - if not set, Configuar will read section variables without prefix. If set, Configuar
reads section properties from by `${prefix}${envName}`. Read more below
* optional (optional, default: `false`) - set `true` to make the section optional like an optional variable. Properties of optional sections are not required to have a value. Do not forget to set regarding type (add `?`) for an optional section.

##### Section prefix
Lets discuss section prefix in detail. Section prefix is a string prepended to every variable of the section. If a section prefix is not explicitly defined, Configuar will behave as prefix is a zero-length string. For example:
```typescript
class ServerConfig {
  @EnvVariable()
  readonly port: number; // hence the section prefix is not set, value will be read from PORT=...
}

class AppConfig {
  @Section()
  http: ServerConfig;
}
```

When prefix is set, Configuar reads a value from `${prefix}${envName}` variable. Attention: a prefix and a variable name are glued without any dividers like "_" or "-". You have to add a divider explicitly to the prefix. For example:
```typescript
class ServerConfig {
  @EnvVariable()
  readonly port: number; // value will be read from SERVER_PORT=...
}

class AppConfig {
  @Section({ prefix: 'SERVER_' })
  http: ServerConfig;
}
```

## API
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
