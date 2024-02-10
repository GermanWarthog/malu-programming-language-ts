import { Program, VariableDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { MAKE_NULL } from "../macros.ts";
import { RuntimeValue } from "../values.ts";

export function evaluateProgram(program: Program, env: Environment): RuntimeValue {
    let lastEvaluated: RuntimeValue = MAKE_NULL();

    for (const statment of program.body) {
        lastEvaluated = evaluate(statment, env);
    }

    return lastEvaluated
}

export function evealuateVariableDeclaration(declaration: VariableDeclaration, env: Environment): RuntimeValue {
    const value = declaration.value ? evaluate(declaration.value, env) : MAKE_NULL();
    return env.declareVariable(declaration.identifier, value, declaration.constant);
}