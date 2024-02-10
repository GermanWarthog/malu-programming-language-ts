import { MAKE_BOOL, MAKE_NATIVE_FUNCTION, MAKE_NULL, MAKE_NUMBER } from "./macros.ts";
import { RuntimeValue } from "./values.ts";

export function createGlobalEnvironment() {
    const env = new Environment();

    env.declareVariable("true", MAKE_BOOL(true), true);
    env.declareVariable("false", MAKE_BOOL(false), true);
    env.declareVariable("null", MAKE_NULL(), true);

    // Native Functions
    env.declareVariable('print', MAKE_NATIVE_FUNCTION((args, scope) => {
        //@ts-ignore
        console.log(args.map(arg => arg.value || `[${arg.type}]`).join(', '));
        return MAKE_NULL();
    }), true);

    env.declareVariable('log', MAKE_NATIVE_FUNCTION((args, scope) => {
        //@ts-ignore
        console.log(...args);
        return MAKE_NULL();
    }), true);

    env.declareVariable('malu', MAKE_NATIVE_FUNCTION((args, scope) => {
        for (let i = 0; i <= 1e10; i++) {
            console.log("I Love You a " + i +" times ♥!\r");
        }
        return MAKE_NULL();
    }), true);

    function timeFunction(_args: RuntimeValue[], _scope: Environment) {
       return MAKE_NUMBER(Date.now());
    }

    env.declareVariable("time", MAKE_NATIVE_FUNCTION(timeFunction), true);

    return env;
}

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeValue>
    private constants: Set<string>;

    constructor(parentENV?: Environment) {
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

    public resolve(varName: string): Environment {
        if (this.variables.has(varName)) {
            return this;
        }

        if (this.parent == undefined) {
            throw `Cannot resolve variable ${varName}`;
        }

        return this.parent.resolve(varName);
    }
}