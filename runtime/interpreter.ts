import { NumberValue, RuntimeValue } from "./values.ts"
import { BinaryExpr, Identifier, NumericLiteral, Program, Statement } from "../frontend/ast.ts"
import Environement from "./environement.ts";
import { MAKE_NULL } from "./macros.ts";


function evaluateProgram(program: Program, env: Environement): RuntimeValue {
    let lastEvaluated: RuntimeValue = MAKE_NULL();

    for (const statment of program.body) {
        lastEvaluated = evaluate(statment, env);
    }

    return lastEvaluated
}

function evaluateBinaryExpression(binOperation: BinaryExpr, env: Environement): RuntimeValue {
    const left = evaluate(binOperation.left, env)
    const right = evaluate(binOperation.right, env)

    if (left.type == 'number' && right.type == 'number') {
        return evaluateNumericExpression(left as NumberValue, right as NumberValue, binOperation.operator)
    }

    return MAKE_NULL();
}

function evaluateNumericExpression(left: NumberValue, right: NumberValue, operator: string): NumberValue {
    let result = 0;

    if (operator == "+") {
        result = left.value + right.value
    } else if (operator == "-") {
        result = left.value - right.value
    } else if (operator == "*") {
        result = left.value * right.value
    } else if (operator == "/") {
        if (right.value == 0 ) {
            console.error('Trying to devide by 0 is not allowed!');
            //@ts-ignore
            Deno.exit(1);
        }
        result = left.value / right.value
    } else if (operator == "%") {
        result = left.value % right.value
    }

    return {
        value: result, 
        type: "number"
    };
}

function evaluateIdentifier(identifier: Identifier, env: Environement): RuntimeValue {
    const value = env.lookupVariable(identifier.symbol);
    return value;
}

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

        case "BinaryExpr":
            return evaluateBinaryExpression(astNode as BinaryExpr, env);

        case "Program":
            return evaluateProgram(astNode as Program, env);

        default:
            console.error("This AST Node has not yet been setup for interpretation.", astNode);
            //@ts-ignore
            Deno.exit(1)
    }
}