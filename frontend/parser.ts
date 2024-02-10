import type { Statement, Program, Expression, BinaryExpr, NumericLiteral, Identifier, VariableDeclaration, AssignmentExpr, Property, ObjectLiteral, CallExpr, MemberExpr, FunctionDeclaration } from "./ast.ts";
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

            case TokenType.Function:
                return this.parseFunctionDeclaration();

            default:
                return this.parseExpression();
        }
    }

    private parseFunctionDeclaration(): Statement {
        this.next();
        const name = this.expect(TokenType.Identifier, "Expected function name following fn keyword.").value;
        const args = this.parseArgs();
        const params: string[] = [];

        for (const arg of args) {
           if (arg.kind !== "Identifier") {
               throw "Function parameters must be identifiers."
           }

           params.push((arg as Identifier).symbol);
        }

        this.expect(TokenType.OpenBrace, "Expected opening brace following function declaration.");

        const body: Statement[] = [];

        while (this.at().type !== TokenType.EndOfFile && this.at().type !== TokenType.CloseBrace) {
            body.push(this.parseStatement());
        }

        this.expect(TokenType.CloseBrace, "Expected closing brace following function declaration.");

        //@ts-ignore
        const func = {
            body,
            name,
            parameters: params,
            kind: "FunctionDeclaration",
        } as FunctionDeclaration;

        return func;
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
        if (this.at().type != TokenType.OpenBrace) {
            return this.parseAdditiveExpression();
        }

        this.next();
        const properties = new Array<Property>();

        while (this.notEndOfFile() && this.at().type != TokenType.CloseBrace) {
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

            if (this.at().type == TokenType.CloseBrace) {
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

            if (this.at().type != TokenType.CloseBrace) {
                this.expect(TokenType.Comma, "Expected comma or closing bracket following property.")
            }
        }

        this.expect(TokenType.CloseBrace, "Object literal missing closing bracket.");
        
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
        let left = this.parseCallMemberExpression();
        
        while (this.at().value == '/' || this.at().value == "*" || this.at().value == "%") {
            const operator = this.next().value;
            const right = this.parseCallMemberExpression();
    
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            } as BinaryExpr;
        }

        return left;
    }

    private parseCallMemberExpression(): Expression {
        const member = this.parseMemberExpression();

        if (this.at().type == TokenType.OpenParen) {
            return this.parseCallExpression(member);
        }

        return member;
    }

    private parseCallExpression(caller: Expression): Expression {
        let callExpression = {
            kind: "CallExpr",
            caller,
            args: this.parseArgs(),
        } as CallExpr;

        if (this.at().type == TokenType.OpenParen) {
            //@ts-ignore
            callExpression = this.parseCallExpression(callExpression)
        }

        return callExpression;
    }

    private parseArgs(): Expression[] {
        this.expect(TokenType.OpenParen, "Expected opening parenthesis following function call.");
        const args = this.at().type == TokenType.CloseParen ? [] : this.parseArgumentList();

        this.expect(TokenType.CloseParen, "Expected closing parenthesis following function call.");
        return args;
    }

    //helper function to parseArgs()
    private parseArgumentList(): Expression[] {
        const args = [this.parseAssignmentExpression()];

        while (this.at().type == TokenType.Comma && this.next()) {
            args.push(this.parseAssignmentExpression());
        }

        return args;
    }

    private parseMemberExpression(): Expression {
        let object = this.parsePrimaryExpression();

        while (this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket) {
            const operator = this.next();
            let property: Expression;
            let computed: boolean;

            if (operator.type == TokenType.Dot) {
                computed = false;
                property = this.parsePrimaryExpression();

                if (property.kind != "Identifier") {
                    throw "Cannot use dot operator with right hand side being an identifier."
                }
            } else {
                computed = true;
                property = this.parseExpression();

                this.expect(TokenType.CloseBracket, "Expected closing bracket following computed property.")
            }
            
            object = {
                kind: "MemberExpr",
                object,
                property,
                computed,
            } as MemberExpr;
        }

        return object;
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