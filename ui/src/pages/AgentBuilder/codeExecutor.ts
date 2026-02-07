/**
 * Secure JavaScript code executor using Web Workers.
 * Code runs in an isolated Worker thread with timeout protection.
 * User code is sent via postMessage, never injected into template strings.
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
}

const EXECUTION_TIMEOUT = 10_000;

// Worker bootstrap script — receives code and context via postMessage
const WORKER_BOOTSTRAP = `
  'use strict';
  self.onmessage = function(e) {
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
      var fn = new Function('context', 'console', '"use strict";\\n' + code);
      var result = fn(ctx, con);
      if (result && typeof result.then === 'function') {
        result.then(function(r) { self.postMessage({ success: true, result: r, logs: logs }); })
              .catch(function(err) { self.postMessage({ success: false, error: String(err), logs: logs }); });
      } else {
        self.postMessage({ success: true, result: result, logs: logs });
      }
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

/** Fallback executor — runs in main thread via setTimeout (less isolated). */
const executeFallback = (
  code: string,
  context: ExecutionContext,
  start: number
): Promise<ExecutionResult> =>
  new Promise((resolve) => {
    const elapsed = () => performance.now() - start;
    const logs: string[] = [];
    const con = {
      log: (...args: unknown[]) =>
        logs.push(
          args
            .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
            .join(' ')
        ),
      warn: (...args: unknown[]) => logs.push('[WARN] ' + args.map(String).join(' ')),
      error: (...args: unknown[]) => logs.push('[ERROR] ' + args.map(String).join(' ')),
      info: (...args: unknown[]) => logs.push('[INFO] ' + args.map(String).join(' ')),
    };
    setTimeout(() => {
      try {
        const fn = new Function('context', 'console', `"use strict";\n${code}`);
        const result = fn(context, con);
        resolve({ success: true, result, logs, duration: elapsed() });
      } catch (err) {
        resolve({ success: false, error: String(err), logs, duration: elapsed() });
      }
    }, 0);
  });

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

    let settled = false;
    const done = (r: ExecutionResult) => {
      if (settled) return;
      settled = true;
      resolve(r);
    };

    let worker: Worker;
    try {
      worker = new Worker(getWorkerUrl());
    } catch {
      // Worker creation failed — use fallback
      executeFallback(code, context, start).then(done);
      return;
    }

    const timer = setTimeout(() => {
      worker.terminate();
      done({
        success: false,
        error: 'Execution timed out after 10s',
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
      worker.postMessage({ code, context });
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
