export enum TokenType {
    // Literal Types
    Number,
    Identifier,

    // Keywords
    Let, 
    Const,
    Function,
    
    // Grouping * Operators
    BinaryOperator,
    Equals,
    Comma,
    Dot,
    Colon,
    Semicolon,
    
    // ()
    OpenParen,
    CloseParen,

    // {}
    OpenBrace,
    CloseBrace,
    
    // []
    OpenBracket,
    CloseBracket,

    EndOfFile
}

const KEYWORDS: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
    func: TokenType.Function
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

function isSkippable(str: string) {
    return str == ' ' || str == '\n' || str == '\t' || str == '\r';
}

function isInt(str: string) {
    const c = str.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];

    return (c >= bounds[0] && c <= bounds[1]);
}

export function Tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("");

    while (src.length > 0) {
        if (src[0] == '(') {
            tokens.push(token(src.shift(), TokenType.OpenParen));
            continue
        }
        
        if (src[0] == ')') {
            tokens.push(token(src.shift(), TokenType.CloseParen));
            continue
        }

        if (src[0] == '{') {
            tokens.push(token(src.shift(), TokenType.OpenBrace));
            continue
        }
        
        if (src[0] == "}") {
            tokens.push(token(src.shift(), TokenType.CloseBrace));
            continue
        }
       
        if (src[0] == '[') {
            tokens.push(token(src.shift(), TokenType.OpenBracket));
            continue
        }
        
        if (src[0] == "]") {
            tokens.push(token(src.shift(), TokenType.CloseBracket));
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
        
        if (src[0] == ";") {
            tokens.push(token(src.shift(), TokenType.Semicolon));
            continue
        }
        
        if (src[0] == ":") {
            tokens.push(token(src.shift(), TokenType.Colon));
            continue
        }

        if (src[0] == ",") {
            tokens.push(token(src.shift(), TokenType.Comma));
            continue
        }
        
        if (src[0] == ".") {
            tokens.push(token(src.shift(), TokenType.Dot));
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