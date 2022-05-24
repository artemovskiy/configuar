import { Schema } from './types';

export interface SchemaReaderInterface<T = any> {
  read(): Schema<T>;
}
