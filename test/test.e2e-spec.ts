import * as fs from 'fs';
import * as YAML from 'yaml';
import { compile } from 'json-schema-to-typescript';
import { ConfigLoader, EnvReader, FileEnvReader } from '../src';
import * as mockFs from 'mock-fs';

describe('Integration tests', () => {
  beforeAll(() => {
    mockFs({
      'config-schema.yaml': `type: object
properties:
  host:
    type: string
  port:
    type: number
  listenQueues:
    type: array
    items:
      type: string
required:
  - host
  - listenQueues
`,
      './test/schema-test-config-1.yaml': `type: object
properties:
  host:
    type: string
  port:
    type: number
  listenQueues:
    type: array
    items:
      type: string
required:
  - host
  - listenQueues
`,
      './test/schema-test-config-2.yaml': `id: ISchemaNameLevel1
type: object
properties:
  arrOfSpecificItems:
    type: array
    items:
      id: ISchemaNameLevel2
      type: object
      properties:
        specialProp:
          type: string
      required:
        - specialProp
required:
  - host
  - listenQueues
`,
      './test/schema-test-config-3.yaml': `ThisIsInvalidSchemaFile`,

      '.env': `HOST=host string value
PORT=3500
LISTEN_QUEUES=[queue1, queue2]
`,
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('should generate d.ts file from yaml configuration', () => {
    test(`should generate interface named Config`, async () => {
      const inputSchemaFilepath = './test/schema-test-config-1.yaml';
      const outputFilepath = './test/config-schema-1.d.ts';

      // Запуск генератора
      await fs.promises
        .readFile(inputSchemaFilepath, 'utf8')
        .then((content) => YAML.parse(content))
        .then((data) => compile(data, 'Config'))
        .then((ts) => fs.writeFileSync(outputFilepath, ts))
        .catch((e) => console.error(e));

      // Проверка генерации файла
      const dtsFileExist = fs.existsSync(outputFilepath);
      expect(dtsFileExist).toBe(true);

      // Проверка содержимого в сгенерированном файле
      const content: string = fs.readFileSync(outputFilepath, 'utf8');
      const fileExportsInterface = content.includes('export interface Config ');
      expect(fileExportsInterface).toBe(true);

      const requiredStringPropExist = content.includes('port?: number');
      expect(requiredStringPropExist).toBe(true);

      const optionalNumericPropExist = content.includes('host: string');
      expect(optionalNumericPropExist).toBe(true);

      const requiredArrayOfStringsExist = content.includes(
        'listenQueues: string[]',
      );
      expect(requiredArrayOfStringsExist).toBe(true);
    });

    test(`should use nesting interfaces and interface names`, async () => {
      const inputSchemaFilepath = './test/schema-test-config-2.yaml';
      const outputFilepath = './test/config-schema-2.d.ts';

      // Запуск генератора
      await fs.promises
        .readFile(inputSchemaFilepath, 'utf8')
        .then((content) => YAML.parse(content))
        .then((data) => compile(data, 'Config'))
        .then((ts) => fs.writeFileSync(outputFilepath, ts))
        .catch((e) => console.error(e));

      // Проверка генерации файла
      const dtsFileExist = fs.existsSync(outputFilepath);
      expect(dtsFileExist).toBe(true);

      // Проверка содержимого в сгенерированном файле

      // Имя интерфейса указанное в схеме в атрибуте "id" имеет более высокий приоритет,
      // чем имя, переданное вторым параметром в compile
      const content: string = fs.readFileSync(outputFilepath, 'utf8');
      const namesInterfaceExported = content.includes(
        'export interface ISchemaNameLevel1',
      );
      expect(namesInterfaceExported).toBe(true);

      const nestedInterfaceExported = content.includes(
        'export interface ISchemaNameLevel2',
      );
      expect(nestedInterfaceExported).toBe(true);

      const nestedInterfaceUsedInMain = content.includes(
        'arrOfSpecificItems?: ISchemaNameLevel2[]',
      );
      expect(nestedInterfaceUsedInMain).toBe(true);
    });

    test(`should throw exception if yaml schema is invalid`, async () => {
      const inputSchemaFilepath = './test/schema-test-config-3.yaml';
      const outputFilepath = './test/config-schema-3.d.ts';

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      // Запуск генератора
      await fs.promises
        .readFile(inputSchemaFilepath, 'utf8')
        .then((content) => YAML.parse(content))
        .then((data) => compile(data, 'Config'))
        .then((ts) => fs.writeFileSync(outputFilepath, ts))
        .catch((e) => console.error(e));

      // Файл не должен сгенерироваться
      const dtsFileExist = fs.existsSync(outputFilepath);
      expect(dtsFileExist).toBe(false);

      // Проверка отлова ошибки
      expect(consoleErrorSpy).toBeCalledTimes(1);
    });
  });

  describe('configuration object', () => {
    test('EnvReader should have values from process', async () => {
      const host = 'host string value';
      const port = 'port string value';
      const listenQueues = '[queue1, queue2]';

      process.env.host = host;
      process.env.port = port;
      process.env.listenQueues = listenQueues;

      const reader = new EnvReader();
      const readHost = reader.read(['host']);
      const readPort = reader.read(['port']);
      const readQueues = reader.read(['listenQueues']);
      const allValues = reader.read(['host', 'port', 'listenQueues']);

      // Получение по одному ключу
      expect(readHost.host).toBe(host);
      expect(readPort.port).toBe(port);
      expect(readQueues.listenQueues).toBe(listenQueues);

      // Получение по нескольким ключам
      expect(allValues.host).toBe(host);
      expect(allValues.port).toBe(port);
      expect(allValues.listenQueues).toBe(listenQueues);
    });

    test('ConfigLoader should return object with parsed values from process.env', async () => {
      const config = new ConfigLoader().getConfig() as any;
      expect(config.host).toBe('host string value');
      expect(config.port).toBe(3500);
      expect(config.listenQueues).toStrictEqual(['queue1', 'queue2']);
    });
  });

  let processEnv;

  beforeEach(() => {
    processEnv = process.env;
    process.env = {};
  });

  afterEach(() => {
    process.env = processEnv;
  });
});
