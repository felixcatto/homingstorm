const dotenv = require('dotenv');
const path = require('path');
const { existsSync } = require('node:fs');

const loadEnv = () => {
  const mode = process.env.NODE_ENV || 'development';
  const envLocalFilePath = path.resolve(__dirname, `../.env.local`);
  const envModeFilePath = path.resolve(__dirname, `../.env.${mode}`);
  const isEnvLocalFileExists = existsSync(envLocalFilePath);
  const isEnvModeFileExists = existsSync(envModeFilePath);

  if (isEnvLocalFileExists) {
    console.log(`Loaded env from ${envLocalFilePath}`);
    dotenv.config({ path: envLocalFilePath });
  }

  if (isEnvModeFileExists) {
    console.log(`Loaded env from ${envModeFilePath}`);
    dotenv.config({ path: envModeFilePath });
  }

  if (!isEnvLocalFileExists && !isEnvModeFileExists) {
    console.log(`No env files found :(`);
  }
};

module.exports = {
  loadEnv,
};
