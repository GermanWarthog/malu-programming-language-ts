import { NullValue, NumberValue, RuntimeValue } from "./values.ts"
import { BinaryExpr, NumericLiteral, Program, Statement } from "../frontend/ast.ts"


function evaluateProgram(program: Program): RuntimeValue {
    let lastEvaluated: RuntimeValue = {type: "null", value: "null"} as NullValue;

    for (const statment of program.body) {
        lastEvaluated = evaluate(statment);
    }

    return lastEvaluated
}

function evaluateBinaryExpression(binOperation: BinaryExpr): RuntimeValue {
    const left = evaluate(binOperation.left)
    const right = evaluate(binOperation.right)

    if (left.type == 'number' && right.type == 'number') {
        return evaluateNumericExpression(left as NumberValue, right as NumberValue, binOperation.operator)
    }

    return {type: "null", value: "null"} as NullValue
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

//@ts-ignore
export function evaluate(astNode: Statement): RuntimeValue {
    switch (astNode.kind) {
        case "NumericLiteral":
            return {
                value: (astNode as NumericLiteral).value, 
                type: "number"
            } as NumberValue;

        case "NullLiteral":
            return {
                value: "null",
                type: "null"
            } as NullValue;

        case "BinaryExpr":
            return evaluateBinaryExpression(astNode as BinaryExpr);

        case "Program":
            return evaluateProgram(astNode as Program);

        default:
            console.error("This AST Node has not yet been setup for interpretation.", astNode);
            //@ts-ignore
            Deno.exit(1)
    }
}