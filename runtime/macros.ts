import { BooleanValue, NullValue, NumberValue } from "./values.ts";

export function MAKE_NUMBER(value: number): NumberValue {
    return {
        type: "number",
        value
    } as NumberValue;
}

export function MAKE_NULL(): NullValue {
    return {
        type: "null",
        value: null
    } as NullValue;
}

export function MAKE_BOOL(value: boolean): BooleanValue {
    return {
        type: "boolean",
        value: value
    } as BooleanValue;
}