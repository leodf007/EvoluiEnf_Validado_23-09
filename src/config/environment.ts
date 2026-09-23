import { AppEnvironment } from '../types';

export interface EnvironmentConfig {
  env: AppEnvironment;
  isProduction: boolean;
  isStaging: boolean;
  isDevelopment: boolean;
  enableDebugLogs: boolean;
  syncIntervalMs: number;
  maxSyncRetries: number;
  apiTimeoutMs: number;
}

/**
 * Resolve o ambiente atual de execução da aplicação de forma segura e determinística.
 * Prioriza VITE_APP_ENV, import.meta.env.MODE ou process.env.NODE_ENV.
 * Nenhuma chave ou credencial sensível é exposta nesta camada.
 */
function resolveAppEnvironment(): AppEnvironment {
  const meta = typeof import.meta !== 'undefined' ? (import.meta as any) : undefined;
  const safeEnv =
    meta && meta.env
      ? meta.env
      : (typeof process !== 'undefined' ? process.env : {}) || {};

  const explicitEnv = (safeEnv.VITE_APP_ENV || safeEnv.APP_ENV || '').toLowerCase();
  if (explicitEnv === 'production' || explicitEnv === 'prod') {
    return 'production';
  }
  if (explicitEnv === 'staging' || explicitEnv === 'stage' || explicitEnv === 'homolog') {
    return 'staging';
  }
  if (explicitEnv === 'development' || explicitEnv === 'dev') {
    return 'development';
  }

  const mode = (safeEnv.MODE || safeEnv.NODE_ENV || '').toLowerCase();
  if (mode === 'production') {
    return 'production';
  }
  if (mode === 'staging' || mode === 'test') {
    return 'staging';
  }

  return 'development';
}

const currentEnv = resolveAppEnvironment();

export const ENV_CONFIG: EnvironmentConfig = {
  env: currentEnv,
  isProduction: currentEnv === 'production',
  isStaging: currentEnv === 'staging',
  isDevelopment: currentEnv === 'development',
  enableDebugLogs: currentEnv !== 'production',
  syncIntervalMs: currentEnv === 'production' ? 15000 : 5000,
  maxSyncRetries: 5,
  apiTimeoutMs: 10000,
};

export function getEnvironmentConfig(): EnvironmentConfig {
  return ENV_CONFIG;
}
