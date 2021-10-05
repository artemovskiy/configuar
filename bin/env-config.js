const fs = require('fs');
const path = require('path');

const YAML = require('YAML');
const { compile } = require('json-schema-to-typescript');
const { program } = require('commander');

program.option('-d, --out-dir', 'directory for generated typing, default src/');

program.parse(process.argv);

const options = program.opts();
const outDirectory =
  typeof options.outDir === 'string' ? options.outDir : 'src/';

s.promises
  .readFile('config-schema.yml', 'utf8')
  .then((content) => YAML.parse(content))
  .then((data) => compile(data, 'Config'))
  .then((ts) =>
    fs.writeFileSync(path.join(outDirectory, 'config-schema.d.ts'), ts),
  )
  .catch((e) => console.error(e));
