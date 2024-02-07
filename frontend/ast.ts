export type NodeType = 
// Statements
| "Program"
| "VariableDeclaration"

// Expressions  
| "NumericLiteral" 
| "Identifier" 
| "BinaryExpr"
| "AssignmentExpr"

export interface Statement {
    kind: NodeType
}

export interface Program extends Statement {
    kind: "Program";
    body: Statement[];
}

export interface VariableDeclaration extends Statement {
    kind: "VariableDeclaration";
    constant: boolean;
    identifier: string;
    value?: Expression;
}

export interface Expression extends Statement {}

export interface BinaryExpr extends Expression {
    kind: "BinaryExpr";
    left: Expression;
    right: Expression;
    operator: string;
}

export interface AssignmentExpr extends Expression {
    kind: "AssignmentExpr";
    assigne: Expression;
    value: Expression;
}

export interface Identifier extends Expression {
    kind: "Identifier";
    symbol: string
}

export interface NumericLiteral extends Expression {
    kind: "NumericLiteral";
    value: number
}