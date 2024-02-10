import { Statement } from "../frontend/ast.ts";
import Environment from "./environment.ts";

export type ValueTypes = "null" | "number" | "boolean" | "object" | "native-function" | "function";

export interface RuntimeValue {
    type: ValueTypes;
}

export interface NullValue extends RuntimeValue {
    type: "null";
    value: null;
}

export interface NumberValue extends RuntimeValue {
    type: "number";
    value: number;
}

export interface BooleanValue extends RuntimeValue {
    type: "boolean";
    value: boolean;
}

export interface ObjectValue extends RuntimeValue {
    type: "object";
    properties: Map<string, RuntimeValue>;
}

export type FunctionCall = (args: RuntimeValue[], env: Environment) => RuntimeValue;
export interface NativeFunctionValue extends RuntimeValue {
    type: "native-function";
    call: FunctionCall;
}

export interface FunctionValue extends RuntimeValue {
    type: "function";
    name: string;
    parameters: string[];
    declarationEnv: Environment;
    body: Statement[];
}