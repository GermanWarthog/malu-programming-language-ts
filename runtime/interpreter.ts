import { NumericLiteral, Identifier, BinaryExpr, Program, VariableDeclaration, AssignmentExpr, ObjectLiteral, CallExpr, FunctionDeclaration } from "../frontend/ast.ts";
import { evaluateIdentifier, evaluateBinaryExpression, evaluateAssignment, evaluateObjectExpression, evaluateCallExpression } from "./evaluations/expressions.ts";
import { evaluateFunctionDeclaration, evaluateProgram, evealuateVariableDeclaration } from "./evaluations/statements.ts";
import { NumberValue } from "./values.ts";

//@ts-ignore
export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
    switch (astNode.kind) {
        case "NumericLiteral":
            return {
                value: (astNode as NumericLiteral).value, 
                type: "number"
            } as NumberValue;

        case "Identifier":
            return evaluateIdentifier(astNode as Identifier, env);

        case "ObjectLiteral":
            return evaluateObjectExpression(astNode as ObjectLiteral, env);
       
        case "CallExpr":
            return evaluateCallExpression(astNode as CallExpr, env);

        case "AssignmentExpr":
            return evaluateAssignment(astNode as AssignmentExpr, env);

        case "BinaryExpr":
            return evaluateBinaryExpression(astNode as BinaryExpr, env);

        case "Program":
            return evaluateProgram(astNode as Program, env);

        case "VariableDeclaration":
            return evealuateVariableDeclaration(astNode as VariableDeclaration, env);

        case "FunctionDeclaration":
            return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);

        default:
            console.error("This AST Node has not yet been setup for interpretation.", astNode);
            //@ts-ignore
            Deno.exit(1)
    }
}