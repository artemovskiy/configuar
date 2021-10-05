import * as fs from 'fs';

import * as JSONSCHEMA from 'json-schema';
import * as YAML from 'yaml';

import {SchemaReaderInterface} from "./schema-reader.interface";


export class FileSchemaReader implements SchemaReaderInterface {

    constructor(
        private readonly filename: string,
    ) {
    }

    read(): JSONSCHEMA.JSONSchema6 {
        const content = fs.readFileSync(this.filename, 'utf8');
        return YAML.parse(content);
    }

}