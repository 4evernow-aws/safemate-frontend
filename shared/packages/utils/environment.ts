import { ENVIRONMENT_CONFIGS } from '../constants/environments';
import { EnvironmentConfig } from '../types/api';

export class EnvironmentManager {
  static getCurrentEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  static getConfig(environment?: string): EnvironmentConfig {
    const env = environment || this.getCurrentEnvironment();
    return ENVIRONMENT_CONFIGS[env] || ENVIRONMENT_CONFIGS.dev;
  }

  static getApiUrl(service: string, environment?: string): string {
    const config = this.getConfig(environment);
    return config.apiEndpoints[service as keyof typeof config.apiEndpoints] || '';
  }

  static isDevelopment(): boolean {
    return this.getCurrentEnvironment() === 'development';
  }

  static isProduction(): boolean {
    return this.getCurrentEnvironment() === 'production';
  }
}
