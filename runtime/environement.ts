import { RuntimeValue } from "./values.ts";

export default class Environement {
    private parent?: Environement;
    private variables: Map<string, RuntimeValue>
    private constants: Set<string>;

    constructor(parentENV?: Environement) {
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVariable(varName: string, value: RuntimeValue, constant: boolean): RuntimeValue {
        if (this.variables.has(varName)) {
            throw `Variable ${varName} already declared in this scope`;
        }

        this.variables.set(varName, value);
        if (constant) {
            this.constants.add(varName);
        }

        return value;
    }

    public assignVariable(varName: string, value: RuntimeValue): RuntimeValue {
        const env = this.resolve(varName);

        if (env.constants.has(varName)) {
            throw `Cannot reasign constant ${varName}`;
        }

        env.variables.set(varName, value);

        return value;
    }

    public lookupVariable(varName: string): RuntimeValue {
        const env = this.resolve(varName);
        return env.variables.get(varName) as RuntimeValue;
    }

    public resolve(varName: string): Environement {
        if (this.variables.has(varName)) {
            return this;
        }

        if (this.parent == undefined) {
            throw `Cannot resolve variable ${varName}`;
        }

        return this.parent.resolve(varName);
    }
}