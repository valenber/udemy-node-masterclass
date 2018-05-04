/* Configuration variables */

const environments = {};

// Staging (default) environment
environments.staging = {
  port: 3000,
  envName: 'staging'
};

// Production environment
environments.production = {
  port: 5000,
  envName: 'production'
};

// Determine which environment is called via CLI
const currentEnvironment = typeof process.env.NODE_ENV !== 'undefined'
  ? process.env.NODE_ENV.toLowerCase()
  : '';

// Choose environment to export
const envToExport = typeof environments[currentEnvironment] === 'object'
  ? environments[currentEnvironment]
  : environments.staging;

// Export environment
module.exports = envToExport;