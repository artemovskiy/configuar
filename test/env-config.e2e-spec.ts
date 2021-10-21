import * as fs from 'fs';
import * as YAML from 'yaml';
import { compile } from 'json-schema-to-typescript';
import * as mockFs from 'mock-fs';

describe('E2E: Interface generator', () => {
  beforeAll(() => {
    mockFs({
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
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('should generate d.ts file from yaml configuration', () => {
    const runner = async (
      inputSchemaFilepath: string,
      outputFilepath: string,
    ) => {
      return fs.promises
        .readFile(inputSchemaFilepath, 'utf8')
        .then((content) => YAML.parse(content))
        .then((data) => compile(data, 'Config'))
        .then((ts) => fs.writeFileSync(outputFilepath, ts))
        .catch((e) => console.error(e));
    };

    test(`d.ts file should have interface named Config`, async () => {
      const inputSchemaFilepath = './test/schema-test-config-1.yaml';
      const outputFilepath = './test/config-schema-1.d.ts';

      // Запуск генератора
      await runner(inputSchemaFilepath, outputFilepath);

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

    test(`d.ts file should use nesting interfaces and interface names`, async () => {
      const inputSchemaFilepath = './test/schema-test-config-2.yaml';
      const outputFilepath = './test/config-schema-2.d.ts';

      // Запуск генератора
      await runner(inputSchemaFilepath, outputFilepath);

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

    test(`generator should throw exception if yaml schema is invalid`, async () => {
      const inputSchemaFilepath = './test/schema-test-config-3.yaml';
      const outputFilepath = './test/config-schema-3.d.ts';

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      // Запуск генератора
      await runner(inputSchemaFilepath, outputFilepath);

      // Файл не должен сгенерироваться
      const dtsFileExist = fs.existsSync(outputFilepath);
      expect(dtsFileExist).toBe(false);

      // Проверка отлова ошибки
      expect(consoleErrorSpy).toBeCalledTimes(1);
    });
  });
});
