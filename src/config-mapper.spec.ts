import * as JSONSCHEMA from 'json-schema';

import { ConfigMapper } from './config-mapper';
import { ParserFactory } from './parser-factory.interface';
import { Parser } from './parser';

const fixtureSchema: JSONSCHEMA.JSONSchema6 = {
  properties: {
    dbUrl: {
      type: 'string',
    },
    port: {
      type: 'number',
    },
    queues: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

class ParserFactoryStub implements ParserFactory {
  createParser = jest.fn();
}

class StubParser implements Parser<any> {
  constructor(private readonly value: any) {}

  parse = jest.fn(() => this.value);
}

describe('ConfigMapper', () => {
  test('should get env keys', () => {
    const mapper = new ConfigMapper(fixtureSchema, new ParserFactoryStub());

    const envKeys = mapper.getEnvKeys();

    expect(envKeys).toEqual(['DB_URL', 'PORT', 'QUEUES']);
  });

  test('should map env values to config object', () => {
    const parserFactory = new ParserFactoryStub();
    const stringParser = new StubParser('mysql://root:123456@localhost:3306');
    const numberParser = new StubParser(3001);
    const arrayParser = new StubParser(['green', 'yellow', 'red']);
    parserFactory.createParser
      .mockReturnValueOnce(stringParser)
      .mockReturnValueOnce(numberParser)
      .mockReturnValueOnce(arrayParser);
    const mapper = new ConfigMapper(fixtureSchema, parserFactory);

    const object = mapper.map({
      DB_URL: 'mysql://root:123456@localhost:3306',
      PORT: '3001',
      QUEUES: '["green", "yellow", "red"]',
    });

    expect(object).toEqual({
      dbUrl: 'mysql://root:123456@localhost:3306',
      port: 3001,
      queues: ['green', 'yellow', 'red'],
    });
    expect(stringParser.parse).toBeCalledWith(
      'mysql://root:123456@localhost:3306',
    );
    expect(numberParser.parse).toBeCalledWith('3001');
    expect(arrayParser.parse).toBeCalledWith('["green", "yellow", "red"]');
  });
});
