import {
  ArrayParser, NumberParser, StringParser, Parser,
} from './parser';
import { Constructor, ArrayCtor, isTypedArrayConstructor } from './schema';

export default class ParserFactory {
  createParser<T>(ctor?: Constructor): Parser<T> {
    if (isTypedArrayConstructor(ctor)) {
      return this.createArrayParse(ctor as ArrayCtor) as unknown as Parser<T>;
    }
    switch (ctor) {
      case Array:
        return this.createArrayParse(ctor as ArrayCtor) as unknown as Parser<T>;
      case Number:
        return this.createNumberParser() as unknown as Parser<T>;
      case String:
      default:
        return this.createStringParser() as unknown as Parser<T>;
    }
  }

  private createNumberParser() {
    return new NumberParser();
  }

  private createArrayParse<I>(schema: ArrayCtor): ArrayParser<I> {
    const itemParser: Parser<I> = this.createParser(schema.itemCtor);
    return new ArrayParser<I>(itemParser);
  }

  private createStringParser(): StringParser {
    return new StringParser();
  }
}
