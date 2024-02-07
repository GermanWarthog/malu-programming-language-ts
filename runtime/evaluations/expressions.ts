import { AssignmentExpr, BinaryExpr, Identifier } from "../../frontend/ast.ts";
import Environement from "../environement.ts";
import { evaluate } from "../interpreter.ts";
import { MAKE_NULL } from "../macros.ts";
import { RuntimeValue, NumberValue } from "../values.ts";

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

export function evaluateBinaryExpression(binOperation: BinaryExpr, env: Environement): RuntimeValue {
    const left = evaluate(binOperation.left, env)
    const right = evaluate(binOperation.right, env)

    if (left.type == 'number' && right.type == 'number') {
        return evaluateNumericExpression(left as NumberValue, right as NumberValue, binOperation.operator)
    }

    return MAKE_NULL();
}

export function evaluateIdentifier(identifier: Identifier, env: Environement): RuntimeValue {
    const value = env.lookupVariable(identifier.symbol);
    return value;
}

export function evaluateAssignment(node: AssignmentExpr, env: Environement): RuntimeValue {
    if (node.assigne.kind != "Identifier") {
        throw `Invalid LHS inside assignment expr ${JSON.stringify(node.assigne)}`
    }

    const varName = (node.assigne as Identifier).symbol;
    return env.assignVariable(varName, evaluate(node.value, env));
}