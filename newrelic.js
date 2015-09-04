/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();
var newRelicLicenseKey = null;

if (appEnv.services.newrelic[0].credentials.licenseKey) {
  newRelicLicenseKey = appEnv.services.newrelic[0].credentials.licenseKey;
}

exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['CTL Frontend'],
  /**
   * Your New Relic license key.
   */
  license_key: newRelicLicenseKey,
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info'
  }
};
