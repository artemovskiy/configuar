import { Command } from 'commander';
import * as path from 'path';
import * as process from 'process';
import { ConfigLoader } from './config-loader';
import { SchemaGenerator } from './validation/schema-generator';

// eslint-disable-next-line import/no-extraneous-dependencies
require('ts-node/register');

const configuarCli = new Command();

const generateSchema = configuarCli.createCommand('get-schema');

const configPathArg = generateSchema.createArgument(
  'config-path',
  'Path to file that exports the main config class. Relatively to current working dir',
);
generateSchema.addArgument(configPathArg);

const exportNameOption = generateSchema.createOption('--export-name <name>', 'Key of module.exports');
generateSchema.addOption(exportNameOption);

generateSchema.action(function (configPath: string) {
  const exportNameOptionValue = this.opts().exportName;
  const exportName = exportNameOptionValue ?? 'default';
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const configModule = require(path.join(process.cwd(), configPath));
  const configClass = configModule[exportName];
  if (!configClass) {
    throw new Error(`ConfigClass is undefined: ${configClass}`);
  }

  const loader = new ConfigLoader({ ctor: configClass });
  const schemaGenerator = new SchemaGenerator(loader.getConfigType());
  const schema = schemaGenerator.getInputObjectSchema();
  console.log(JSON.stringify(schema, undefined, 2));
});

configuarCli.addCommand(generateSchema);
configuarCli.parse(process.argv);
