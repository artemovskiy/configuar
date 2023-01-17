## Decorators

#### EnvVariable(options?: Options)
Decorator for config field which should be read from environment.
##### Options
* type (optional) - where the Configuar can get type automatically it does it, but TypeScript does not support
  reflection for complex types like arrays. So for complex types you should explicitly define env variable type by
  this option. Also, if you want, you may set type for primitive types, like strings, too.

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
