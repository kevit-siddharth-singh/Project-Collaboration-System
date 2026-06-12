export const CONFIG_KEYS = {
  DATABASE_URI: 'database.uri',

  JWT_ACCESS_SECRET: 'jwt.accessSecret',
  JWT_ACCESS_EXPIRES_IN: 'jwt.accessExpiresIn',

  JWT_REFRESH_SECRET: 'jwt.refreshSecret',
  JWT_REFRESH_EXPIRES_IN: 'jwt.refreshExpiresIn',

  PORT: 'app.port',
  NODE_ENV: 'app.nodeEnv',
} as const;
