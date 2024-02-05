import type { Statement, Program, Expression, BinaryExpr, NumericLiteral, Identifier, NullLiteral } from "./ast.ts";
import { Tokenize, type Token, TokenType } from "./lexer.ts";

export default class Parser {
    private tokens: Token[] = []

    private notEndOfFile(): boolean {
        return this.tokens[0].type != TokenType.EndOfFile
    }
    
    private at() {
        return this.tokens[0] as Token;
    }

    private next() { // eat token
        const previous = this.tokens.shift() as Token;
        return previous;
    }

    private expect(type: TokenType, err: any) {
        const prev = this.tokens.shift() as Token;

        if (!prev || prev.type != type) {
            console.log("Parser Error:\n", err, prev, "- Expecting: ", type)
            //@ts-ignore
            Deno.exit(1)
        }
    }

    private parseStatement(): Statement {
        return this.parseExpression()
    }

    private parseExpression(): Expression {
        return this.parseAdditiveExpression();
    }

    private parseAdditiveExpression(): Expression {
        let left = this.parseMultiplicativeExpression();
        
        while (this.at().value == '+' || this.at().value == "-") {
            const operator = this.next().value;
            const right = this.parseMultiplicativeExpression();
    
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            } as BinaryExpr;
        }

        return left;
    }
    
    private parseMultiplicativeExpression(): Expression {
        let left = this.parsePrimaryExpression();
        
        while (this.at().value == '/' || this.at().value == "*" || this.at().value == "%") {
            const operator = this.next().value;
            const right = this.parsePrimaryExpression();
    
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            } as BinaryExpr;
        }

        return left;
    }

    // @ts-ignore
    private parsePrimaryExpression(): Expression {
        const token = this.at().type;

        switch (token) {
            case TokenType.Identifier:
                return {kind: "Identifier", symbol: this.next().value } as Identifier

            case TokenType.Null:
                this.next();
                return {kind: "NullLiteral", value: "null"} as NullLiteral;

            case TokenType.Number:
                return {kind: "NumericLiteral", value: parseFloat(this.next().value) } as NumericLiteral

            case TokenType.OpenParen: {
                this.next();
                const value = this.parseExpression();
                this.expect(TokenType.CloseParen, "Unexpected token found inside parenthesised expression. Expected closing parenthesis.")
                return value;
            }
                
            default:
                console.error("Unexpected token found during parsing!", this.at())
                // @ts-ignore
                Deno.exit(1)  
        }
    }

    public produceAST(sourceCode: string): Program {
        this.tokens = Tokenize(sourceCode)

        const program: Program = {
            kind: "Program",
            body: []
        }

        while (this.notEndOfFile()) {
            program.body.push(this.parseStatement())
        }

        return program;
    }
}