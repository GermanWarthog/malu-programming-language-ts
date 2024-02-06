import Parser from "./frontend/parser.ts";
import Environement from "./runtime/environement.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { MAKE_BOOL, MAKE_NULL, MAKE_NUMBER } from "./runtime/macros.ts";

repl();

function repl() {
  const parser = new Parser();
  const env = new Environement();

  env.declareVariable("x", MAKE_NUMBER(100));
  env.declareVariable("true", MAKE_BOOL(true));
  env.declareVariable("false", MAKE_BOOL(false));
  env.declareVariable("null", MAKE_NULL());

  console.log("\nRepl v0.1");

  // Continue Repl Until User Stops Or Types `exit`
  while (true) {
    const input = prompt("> ");
    // Check for no user input or exit keyword.
    if (!input || input.includes("exit")) {
    // @ts-ignore
      Deno.exit(1);
    }

    // Produce AST From sourc-code
    // @ts-ignore
    const program = parser.produceAST(input);
    console.log(program);

    const results = evaluate(program, env);
    console.log(results)
  }
}