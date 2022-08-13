import { Type } from 'typereader';
import { Parser } from './parser';

export interface ParserFactory {
  createParser<T>(ctor: Type): Parser<T>;
}
