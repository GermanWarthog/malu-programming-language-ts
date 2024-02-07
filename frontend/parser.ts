import type { Statement, Program, Expression, BinaryExpr, NumericLiteral, Identifier, VariableDeclaration, AssignmentExpr } from "./ast.ts";
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

        return prev;
    }

    private parseStatement(): Statement {
        switch (this.at().type) {
            case TokenType.Let:
                return this.parseVariableDeclaration();
            case TokenType.Const:
                return this.parseVariableDeclaration();

            default:
                return this.parseAdditiveExpression();
        }
    }

    private parseExpression(): Expression {
        return this.parseAssgnmentExpression();
    }

    private parseAssgnmentExpression(): Expression {
        const left = this.parseAdditiveExpression();
        
        if (this.at().type == TokenType.Equals) {
            const value = this.parseAssgnmentExpression();

            return {
                value,
                assigne: left,
                kind: "AssignmentExpr",
            } as AssignmentExpr
        }

        return left;
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

    private parseVariableDeclaration(): Statement {
        const isConstant = this.next().type == TokenType.Const;
        const identifier = this.expect(TokenType.Identifier, "Expected identifier name following let | const keywords.").value;

        if (this.at().type == TokenType.Semicolon) {
            
            this.next();

            if (isConstant) {
                throw "Must assign a value to a constant variable."
            }

            return {
                kind: "VariableDeclaration", 
                identifier, 
                constant: false, 
                value: undefined
            } as VariableDeclaration
        }

        this.expect(TokenType.Equals, "Expected equals sign following variable declaration.");
        
        const declaration = {
            kind: "VariableDeclaration",
            identifier,
            constant: isConstant,
            value: this.parseExpression()
        } as VariableDeclaration;

        this.expect(TokenType.Semicolon, "Expected semicolon following variable declaration.");

        return declaration;
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