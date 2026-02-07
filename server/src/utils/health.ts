import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface HealthConfig {
  name: string;
  version: string;
  port: string | number;
  domain: string;
  description: string;
  uiUrl: string;
  serverUrl: string;
  criticalPackages: string[];
  checkDependencies: () => Promise<Record<string, string>>;
}

interface RootHandlerConfig extends HealthConfig {
  endpoints: Record<string, string>;
}

function getPackageVersions(packages: string[]): Record<string, string> {
  const versions: Record<string, string> = {};
  for (const pkg of packages) {
    try {
      const pkgJsonPath = join(process.cwd(), 'node_modules', pkg, 'package.json');
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
      versions[pkg] = pkgJson.version || 'unknown';
    } catch {
      versions[pkg] = 'not installed';
    }
  }
  return versions;
}

export function createRootHandler(config: RootHandlerConfig) {
  return (_req: Request, res: Response): void => {
    res.json({
      name: config.name,
      version: config.version,
      description: config.description,
      status: 'running',
      domain: config.domain,
      uiUrl: config.uiUrl,
      serverUrl: config.serverUrl,
      endpoints: config.endpoints,
      timestamp: new Date().toISOString(),
    });
  };
}

export function createHealthHandler(config: HealthConfig) {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      const dependencies = await config.checkDependencies();
      const packages = getPackageVersions(config.criticalPackages);

      const allDepsUp = Object.values(dependencies).every((s) => s === 'UP');

      res.status(allDepsUp ? 200 : 503).json({
        status: allDepsUp ? 'healthy' : 'degraded',
        name: config.name,
        version: config.version,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        dependencies,
        packages,
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        name: config.name,
        version: config.version,
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  };
}
