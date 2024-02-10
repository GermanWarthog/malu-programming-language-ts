export type ValueTypes = "null" | "number" | "boolean" | "object";

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