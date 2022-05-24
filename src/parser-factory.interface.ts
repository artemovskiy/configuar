import { Parser } from './parser';
import { Constructor } from './schema/types';

export interface ParserFactory {
  createParser<T>(ctor: Constructor): Parser<T>;
}
