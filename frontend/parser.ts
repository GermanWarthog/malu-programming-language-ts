import type { Statement, Program, Expression, BinaryExpr, NumericLiteral, Identifier, VariableDeclaration, AssignmentExpr, Property, ObjectLiteral } from "./ast.ts";
import { Tokenize, type Token, TokenType } from "./lexer.ts";

export default class Parser {
    private tokens: Token[] = [];

    private notEndOfFile(): boolean {
        return this.tokens[0].type != TokenType.EndOfFile;
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

    private parseStatement(): Statement {
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parseVariableDeclaration();

            default:
                return this.parseExpression();
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
            } as VariableDeclaration
        }

        this.expect(TokenType.Equals, "Expected equals sign following variable declaration.");
        
        const declaration = {
            kind: "VariableDeclaration",
            value: this.parseExpression(),
            identifier,
            constant: isConstant,
        } as VariableDeclaration;

        this.expect(TokenType.Semicolon, "Expected semicolon following variable declaration.");

        return declaration;
    }

    private parseExpression(): Expression {
        return this.parseAssignmentExpression();
    }

    private parseAssignmentExpression(): Expression {
        const left = this.parseObjectExpression();
        
        if (this.at().type == TokenType.Equals) {
            this.next();
            const value = this.parseAssignmentExpression();

            return {
                value,
                assigne: left,
                kind: "AssignmentExpr",
            } as AssignmentExpr
        }

        return left;
    }

    private parseObjectExpression(): Expression {
        if (this.at().type != TokenType.OpenBracket) {
            return this.parseAdditiveExpression();
        }

        this.next();
        const properties = new Array<Property>();

        while (this.notEndOfFile() && this.at().type != TokenType.CloseBracket) {
            const key = this.expect(TokenType.Identifier, "Object literal missing key name.").value;

            if (this.at().type == TokenType.Comma) {
                this.next();
                properties.push({
                    key, 
                    kind: "Property", 
                    value: undefined
                } as Property);

                continue;
            }

            if (this.at().type == TokenType.CloseBracket) {
                properties.push({
                    key, 
                    kind: "Property"
                });

                continue;
            }

            this.expect(TokenType.Colon, "Object literal missing colon following identifier in ObjectExpr");
            const value = this.parseExpression();

            properties.push({
                kind: "Property", 
                value, 
                key
            });

            if (this.at().type != TokenType.CloseBracket) {
                this.expect(TokenType.Comma, "Expected comma or closing bracket following property.")
            }
        }

        this.expect(TokenType.CloseBracket, "Object literal missing closing bracket.");
        
        return {
            kind: "ObjectLiteral",
            properties
        } as ObjectLiteral;
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
                return {
                    kind: "Identifier", 
                    symbol: this.next().value 
                } as Identifier

            case TokenType.Number:
                return {
                    kind: "NumericLiteral", 
                    value: parseFloat(this.next().value) 
                } as NumericLiteral

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
}