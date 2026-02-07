/**
 * Code executor with Node.js-like support.
 * Runs in a module Web Worker with:
 *  - async/await support
 *  - require() shim that loads packages from esm.sh CDN
 *  - import statement rewriting
 *  - fetch, setTimeout, etc.
 */

export interface ExecutionContext {
  config: Record<string, string>;
  nodeId: string;
  nodeName: string;
  category: string;
  inputs: Record<string, unknown>;
}

export interface ExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  logs: string[];
  duration: number;
  detectedPackages?: string[];
}

const EXECUTION_TIMEOUT = 30_000;

/**
 * Detect require('x') and import ... from 'x' in user code,
 * return unique package names.
 */
export const detectPackages = (code: string): string[] => {
  const pkgs = new Set<string>();
  // require('pkg') or require("pkg")
  const reqRe = /require\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = reqRe.exec(code))) pkgs.add(m[1].split('/')[0]);
  // import ... from 'pkg'
  const impRe = /import\s+.*?\s+from\s+['"]([^'"./][^'"]*)['"]/g;
  while ((m = impRe.exec(code))) pkgs.add(m[1].split('/')[0]);
  return [...pkgs];
};

/**
 * Rewrite import/require statements to async CDN-based require.
 * - import X from 'pkg' → const X = await require('pkg')
 * - import { a, b } from 'pkg' → const { a, b } = await require('pkg')
 * - import * as X from 'pkg' → const X = await require('pkg')
 * - const X = require('pkg') → const X = await require('pkg')
 */
const rewriteImports = (code: string): string =>
  code
    .replace(
      /import\s+(\*\s+as\s+\w+|\{[^}]+\}|\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
      (_, binding: string, pkg: string) => {
        const b = binding.replace(/\*\s+as\s+/, '');
        return `const ${b} = await require('${pkg}');`;
      }
    )
    .replace(
      /(?:const|let|var)\s+(\{[^}]+\}|\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      (_, binding: string, pkg: string) => `const ${binding} = await require('${pkg}')`
    );

// Module Worker bootstrap — supports async + require from CDN
const WORKER_BOOTSTRAP = `
  'use strict';
  const moduleCache = {};

  async function require(name) {
    if (moduleCache[name]) return moduleCache[name];
    try {
      const mod = await import('https://esm.sh/' + name + '?bundle');
      moduleCache[name] = mod.default !== undefined ? mod.default : mod;
      return moduleCache[name];
    } catch(err) {
      throw new Error('Cannot load module "' + name + '": ' + err.message + '. Package may not exist or is not browser-compatible.');
    }
  }

  self.onmessage = async function(e) {
    var code = e.data.code;
    var ctx = e.data.context;
    var logs = [];
    var con = {
      log: function() { var a=[]; for(var i=0;i<arguments.length;i++){a.push(typeof arguments[i]==='object'?JSON.stringify(arguments[i]):String(arguments[i]));} logs.push(a.join(' ')); },
      warn: function() { var a=[]; for(var i=0;i<arguments.length;i++){a.push(String(arguments[i]));} logs.push('[WARN] '+a.join(' ')); },
      error: function() { var a=[]; for(var i=0;i<arguments.length;i++){a.push(String(arguments[i]));} logs.push('[ERROR] '+a.join(' ')); },
      info: function() { var a=[]; for(var i=0;i<arguments.length;i++){a.push(String(arguments[i]));} logs.push('[INFO] '+a.join(' ')); }
    };
    try {
      var AsyncFn = Object.getPrototypeOf(async function(){}).constructor;
      var fn = new AsyncFn('context', 'console', 'require', '"use strict";\\n' + code);
      var result = await fn(ctx, con, require);
      self.postMessage({ success: true, result: result, logs: logs });
    } catch(err) {
      self.postMessage({ success: false, error: String(err), logs: logs });
    }
  };
`;

let workerBlobUrl: string | null = null;
function getWorkerUrl(): string {
  if (!workerBlobUrl) {
    const blob = new Blob([WORKER_BOOTSTRAP], { type: 'application/javascript' });
    workerBlobUrl = URL.createObjectURL(blob);
  }
  return workerBlobUrl;
}

/** Fallback executor — runs in main thread with async require. */
const executeFallback = async (
  code: string,
  context: ExecutionContext,
  start: number
): Promise<ExecutionResult> => {
  const elapsed = () => performance.now() - start;
  const logs: string[] = [];
  const con = {
    log: (...args: unknown[]) =>
      logs.push(
        args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
      ),
    warn: (...args: unknown[]) => logs.push('[WARN] ' + args.map(String).join(' ')),
    error: (...args: unknown[]) => logs.push('[ERROR] ' + args.map(String).join(' ')),
    info: (...args: unknown[]) => logs.push('[INFO] ' + args.map(String).join(' ')),
  };
  const moduleCache: Record<string, unknown> = {};
  const require = async (name: string) => {
    if (moduleCache[name]) return moduleCache[name];
    const mod = await import(/* @vite-ignore */ `https://esm.sh/${name}?bundle`);
    moduleCache[name] = mod.default !== undefined ? mod.default : mod;
    return moduleCache[name];
  };
  try {
    const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;
    const fn = new AsyncFn('context', 'console', 'require', `"use strict";\n${code}`);
    const result = await fn(context, con, require);
    return { success: true, result, logs, duration: elapsed() };
  } catch (err) {
    return { success: false, error: String(err), logs, duration: elapsed() };
  }
};

export const executeCode = (
  code: string,
  context: ExecutionContext
): Promise<ExecutionResult> =>
  new Promise((resolve) => {
    const start = performance.now();
    const elapsed = () => performance.now() - start;

    if (!code.trim()) {
      resolve({ success: true, logs: ['No code to execute — skipped'], duration: 0 });
      return;
    }

    // Rewrite import/require to async CDN form
    const rewritten = rewriteImports(code);
    const pkgs = detectPackages(code);

    let settled = false;
    const done = (r: ExecutionResult) => {
      if (settled) return;
      settled = true;
      resolve({ ...r, detectedPackages: pkgs.length > 0 ? pkgs : undefined });
    };

    let worker: Worker;
    try {
      worker = new Worker(getWorkerUrl());
    } catch {
      executeFallback(rewritten, context, start).then(done);
      return;
    }

    const timer = setTimeout(() => {
      worker.terminate();
      done({
        success: false,
        error: 'Execution timed out after 30s',
        logs: [],
        duration: elapsed(),
      });
    }, EXECUTION_TIMEOUT);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      done({
        success: e.data.success,
        result: e.data.result,
        error: e.data.error,
        logs: e.data.logs || [],
        duration: elapsed(),
      });
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      done({
        success: false,
        error: e.message || 'Worker error',
        logs: [],
        duration: elapsed(),
      });
    };

    try {
      worker.postMessage({ code: rewritten, context });
    } catch (err) {
      clearTimeout(timer);
      worker.terminate();
      done({
        success: false,
        error: `Failed to send code to worker: ${err}`,
        logs: [],
        duration: elapsed(),
      });
    }
  });
