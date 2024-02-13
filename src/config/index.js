const config = {
  IsDev: process.env.NODE_ENV === 'dev',
  IsTest: process.env.NODE_ENV === 'test',
  IsProd: process.env.NODE_ENV === 'prod',

  Port: (process.env.PORT && parseInt(process.env.PORT, 10)) || 3000,

  Database: {
    Host: process.env.DB_HOSTNAME,
    Name: process.env.DB_NAME,
    User: process.env.DB_USER,
    Password: process.env.DB_PASSWORD,
    Dialect: 'mysql',
    Charset: 'utf8mb4',
    Collate: 'utf8mb4_unicode_ci',
    LogQuery: !!process.env.LOG_QUERY,
  },
};

module.exports = config;
