/**
 * Secure JavaScript code executor using Web Workers.
 * Avoids eval() — code runs in an isolated Worker thread with a timeout.
 */

export interface ExecutionContext {
  config: Record<string, string>;
  nodeId: string;
  nodeName: string;
  category: string;
}

export interface ExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  logs: string[];
  duration: number;
}

const EXECUTION_TIMEOUT = 10000; // 10 seconds

export const executeCode = (
  code: string,
  context: ExecutionContext
): Promise<ExecutionResult> => {
  return new Promise((resolve) => {
    const start = performance.now();

    // Build worker script that wraps user code in a safe closure
    const workerScript = `
      'use strict';
      const __logs = [];
      const console = {
        log: (...args) => __logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        warn: (...args) => __logs.push('[WARN] ' + args.map(a => String(a)).join(' ')),
        error: (...args) => __logs.push('[ERROR] ' + args.map(a => String(a)).join(' ')),
        info: (...args) => __logs.push('[INFO] ' + args.map(a => String(a)).join(' ')),
      };

      const context = ${JSON.stringify(context)};

      async function __run() {
        ${code}
      }

      __run()
        .then((result) => self.postMessage({ success: true, result, logs: __logs }))
        .catch((err) => self.postMessage({ success: false, error: String(err), logs: __logs }));
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        success: false,
        error: `Execution timed out after ${EXECUTION_TIMEOUT / 1000}s`,
        logs: [],
        duration: performance.now() - start,
      });
    }, EXECUTION_TIMEOUT);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        success: e.data.success,
        result: e.data.result,
        error: e.data.error,
        logs: e.data.logs || [],
        duration: performance.now() - start,
      });
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({
        success: false,
        error: e.message || 'Unknown worker error',
        logs: [],
        duration: performance.now() - start,
      });
    };
  });
};
