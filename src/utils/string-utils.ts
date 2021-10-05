type QuoteKind = '"' | "'" | false;
const getQuoteKind = (char: string): QuoteKind =>
  char === '"' || char === "'" ? char : false;

export const trimQuotes = (value: string) => {
  const opening = getQuoteKind(value.charAt(0));
  const trailing = getQuoteKind(value.charAt(value.length - 1));
  if (opening !== trailing) {
    throw new SyntaxError();
  }
  return opening ? value.substring(1, value.length - 1) : value;
};
