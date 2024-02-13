const dotenv = require('dotenv');

(async () => {
  try {
    // loading env file
    dotenv.config();

    // Loading main package
    // eslint-disable-next-line global-require
    await require('../app');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('*** Error in loading env ***', e);
  }
})();
