/* Configuration variables */

const environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: '11maidsBornWalking',
  maxChecks: 5
};

// Production environment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'drummerAte17reserved',
  maxChecks: 5
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