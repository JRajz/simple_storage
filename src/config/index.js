const config = {
  // Environment flags
  isDev: process.env.NODE_ENV === 'dev',
  isTest: process.env.NODE_ENV === 'test',
  isProd: process.env.NODE_ENV === 'prod',

  // Port configuration with fallback to 3000
  PORT: (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000,

  // Database configuration
  DATABASE: {
    HOST: process.env.DB_HOSTNAME,
    NAME: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DIALECT: 'mysql',
    CHARSET: 'utf8mb4',
    COLLATE: 'utf8mb4_unicode_ci',
    LOG_QUERY: !!process.env.LOG_QUERY,
  },

  REDIS: {
    HOST: process.env.REDIS_HOST,
    PORT: process.env.REDIS_PORT,
  },
};

module.exports = config;
