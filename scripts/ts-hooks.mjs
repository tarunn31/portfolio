// Node loader hooks so plain scripts can import this project's TypeScript (no extra dependency:
// it uses the TypeScript compiler already installed). Resolves "@/..." and extensionless imports.
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function tryFile(p) {
  for (const c of [p, `${p}.ts`, `${p}.tsx`, path.join(p, "index.ts")]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  let found = null;
  if (specifier.startsWith("@/")) {
    found = tryFile(path.join(root, specifier.slice(2)));
  } else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    found = tryFile(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier));
  }
  if (found) return { url: pathToFileURL(found).href, shortCircuit: true };
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith(".ts") || url.endsWith(".tsx")) {
    const fileName = fileURLToPath(url);
    const source = await readFile(fileName, "utf8");
    const { outputText } = ts.transpileModule(source, {
      fileName,
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    return { format: "module", source: outputText, shortCircuit: true };
  }
  return next(url, context);
}
