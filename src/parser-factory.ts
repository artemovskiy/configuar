import {
  ArrayType, LiteralType, Type, TypeKind,
} from 'typereader';
import {
  ArrayParser, BooleanParser, NumberParser, Parser, StringParser,
} from './parser';
import { ParserFactory as IParserFactory } from './parser-factory.interface';

export default class ParserFactory implements IParserFactory {
  createParser<T>(type: Type): Parser<T> {
    switch (type.getKind()) {
      case TypeKind.Array:
        return this.createArrayParse(type.as(TypeKind.Array)) as unknown as Parser<T>;
      case TypeKind.LiteralType:
        return this.createLiteralTypeParser(type.as(TypeKind.LiteralType)) as unknown as Parser<T>;
      default:
        throw new TypeError(`Unexpected type: ${type.getKind()}`);
    }
  }

  private createLiteralTypeParser(type: LiteralType): Parser<string> | Parser<number> | Parser<boolean> {
    switch (type.getConstructorReference()) {
      case Number:
        return this.createNumberParser();
      case Boolean:
        return this.createBooleanParser();
      case String:
      default:
        return this.createStringParser();
    }
  }

  private createBooleanParser(): Parser<boolean> {
    return new BooleanParser();
  }

  private createNumberParser() {
    return new NumberParser();
  }

  private createArrayParse<I>(type: ArrayType): ArrayParser<I> {
    const itemParser: Parser<I> = this.createParser(type.getElementType());
    return new ArrayParser<I>(itemParser);
  }

  private createStringParser(): StringParser {
    return new StringParser();
  }
}
