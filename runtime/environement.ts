import { RuntimeValue } from "./values.ts";

export default class Environement {
    private parent?: Environement;
    private variables: Map<string, RuntimeValue>

    constructor(parentENV?: Environement) {
        this.parent = parentENV;
        this.variables = new Map();
    }

    public declareVariable(varName: string, value: RuntimeValue): RuntimeValue {
        if (this.variables.has(varName)) {
            throw `Variable ${varName} already declared in this scope`;
        }

        this.variables.set(varName, value);
        return value;
    }

    public asignVariable(varName: string, value: RuntimeValue): RuntimeValue {
        const env = this.resolve(varName);
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