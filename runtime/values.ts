export type ValueTypes = "null" | "number";

export interface RuntimeValue {
    type: ValueTypes;
}

export interface NullValue extends RuntimeValue {
    type: "null";
    value: "null";
}

export interface NumberValue extends RuntimeValue {
    type: "number";
    value: number;
}