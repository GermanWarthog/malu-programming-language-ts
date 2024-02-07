import { NumericLiteral, Identifier, BinaryExpr, Program, VariableDeclaration, AssignmentExpr } from "../frontend/ast.ts";
import { evaluateIdentifier, evaluateBinaryExpression, evaluateAssignment } from "./evaluations/expressions.ts";
import { evaluateProgram, evealuateVariableDeclaration } from "./evaluations/statements.ts";
import { NumberValue } from "./values.ts";

//@ts-ignore
export function evaluate(astNode: Statement, env: Environement): RuntimeValue {
    switch (astNode.kind) {
        case "NumericLiteral":
            return {
                value: (astNode as NumericLiteral).value, 
                type: "number"
            } as NumberValue;

        case "Identifier":
            return evaluateIdentifier(astNode as Identifier, env);

        case "AssignmentExpr":
            return evaluateAssignment(astNode as AssignmentExpr, env);

        case "BinaryExpr":
            return evaluateBinaryExpression(astNode as BinaryExpr, env);

        case "Program":
            return evaluateProgram(astNode as Program, env);

        case "VariableDeclaration":
            return evealuateVariableDeclaration(astNode as VariableDeclaration, env);

        default:
            console.error("This AST Node has not yet been setup for interpretation.", astNode);
            //@ts-ignore
            Deno.exit(1)
    }
}