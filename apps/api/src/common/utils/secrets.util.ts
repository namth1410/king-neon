import { readFileSync, existsSync } from 'fs';

/**
 * Get a config value, supporting Docker Swarm secrets.
 *
 * For Docker Swarm, secrets are mounted as files at /run/secrets/<name>.
 * This function checks for a _FILE variant of the env var first,
 * then falls back to the regular env var.
 *
 * Example:
 *   - DATABASE_PASSWORD_FILE=/run/secrets/db_password -> reads file
 *   - DATABASE_PASSWORD=secret123 -> uses value directly
 */
export function getSecretOrEnv(
  envKey: string,
  defaultValue?: string,
): string | undefined {
  const fileEnvKey = `${envKey}_FILE`;
  const filePath = process.env[fileEnvKey];

  // Check if _FILE variant is set and file exists
  if (filePath && existsSync(filePath)) {
    try {
      return readFileSync(filePath, 'utf8').trim();
    } catch {
      console.warn(`Warning: Could not read secret file: ${filePath}`);
    }
  }

  // Fall back to regular env var
  return process.env[envKey] || defaultValue;
}

/**
 * Get a required secret - throws if not found
 */
export function getRequiredSecret(envKey: string): string {
  const value = getSecretOrEnv(envKey);
  if (!value) {
    throw new Error(
      `Required configuration missing: ${envKey} (or ${envKey}_FILE)`,
    );
  }
  return value;
}
