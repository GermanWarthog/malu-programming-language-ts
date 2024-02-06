export enum TokenType {
    Number,
    Identifier,
    Equals,
    OpenParen, CloseParen,
    BinaryOperator,
    Let,
    EndOfFile
}

const KEYWORDS: Record<string, TokenType> = {
    let: TokenType.Let,
}

export interface Token {
    value: string,
    type: TokenType
}

function token(value = "", type: TokenType): Token {
    return {value, type}
}

function isAlpha(src: string) {
    return src.toUpperCase() != src.toLowerCase();
}

function isInt(str: string) {
    const c = str.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];

    return (c >= bounds[0] && c <= bounds[1]);
}

function isSkippable(str: string) {
    return str == ' ' || str == '\n' || str == '\t';
}

export function Tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("");

    while (src.length > 0) {
        if (src[0] == '(') {
            tokens.push(token(src.shift(), TokenType.OpenParen));
            continue
        }
        
        if (src[0] == ")") {
            tokens.push(token(src.shift(), TokenType.CloseParen));
            continue
        }

        if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%") {
            tokens.push(token(src.shift(), TokenType.BinaryOperator));
            continue
        }

        if (src[0] == "=") {
            tokens.push(token(src.shift(), TokenType.Equals));
            continue
        }

        if (isInt(src[0])) {
            let number = "";
            while (src.length > 0 && isInt(src[0])) {
                number += src.shift();
            }

            tokens.push(token(number, TokenType.Number));
            continue
        }

        if (isAlpha(src[0])) {
            let identifier = "";
            while (src.length > 0 && isAlpha(src[0])) {
                identifier += src.shift();
            }

            const reserved = KEYWORDS[identifier];
            tokens.push(token(identifier, typeof reserved == "number" ? reserved : TokenType.Identifier))
            
            continue
        }

        if (isSkippable(src[0])) {
            src.shift();
            continue
        }

        console.log('Invalid character found in source: ', src[0])
        break;
    }

    tokens.push({type: TokenType.EndOfFile, value: "EndOfFile"})

    return tokens;
}