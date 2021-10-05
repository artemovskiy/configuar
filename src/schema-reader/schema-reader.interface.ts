import * as JSONSCHEMA from 'json-schema';

export interface SchemaReaderInterface {
    read(): JSONSCHEMA.JSONSchema6
}