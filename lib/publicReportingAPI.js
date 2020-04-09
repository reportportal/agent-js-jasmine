const ClientPublicReportingAPI = require('reportportal-client/lib/publicReportingAPI');
const LOG_LEVELS = require('./constants/logLevels');

const PublicReportingAPI = {
    addAttributes: (attributes, suite) =>
        ClientPublicReportingAPI.addAttributes(attributes, suite),
    setDescription: (text, suite) =>
        ClientPublicReportingAPI.setDescription(text, suite),
    log: (level = LOG_LEVELS.INFO, message = '', file, suite) =>
        ClientPublicReportingAPI.addLog({ level, file, message }, suite),
    launchLog: (level = LOG_LEVELS.INFO, message = '', file) =>
        ClientPublicReportingAPI.addLaunchLog({ level, file, message }),
    launchTrace: (message, file) => PublicReportingAPI.launchLog(LOG_LEVELS.TRACE, message, file),
    launchDebug: (message, file) => PublicReportingAPI.launchLog(LOG_LEVELS.DEBUG, message, file),
    launchInfo: (message, file) => PublicReportingAPI.launchLog(LOG_LEVELS.INFO, message, file),
    launchWarn: (message, file) => PublicReportingAPI.launchLog(LOG_LEVELS.WARN, message, file),
    launchError: (message, file) => PublicReportingAPI.launchLog(LOG_LEVELS.ERROR, message, file),
    launchFatal: (message, file) => PublicReportingAPI.launchLog(LOG_LEVELS.FATAL, message, file),
    trace: (message, file, suite) => PublicReportingAPI.log(LOG_LEVELS.TRACE, message, file, suite),
    debug: (message, file, suite) => PublicReportingAPI.log(LOG_LEVELS.DEBUG, message, file, suite),
    info: (message, file, suite) => PublicReportingAPI.log(LOG_LEVELS.INFO, message, file, suite),
    warn: (message, file, suite) => PublicReportingAPI.log(LOG_LEVELS.WARN, message, file, suite),
    error: (message, file, suite) => PublicReportingAPI.log(LOG_LEVELS.ERROR, message, file, suite),
    fatal: (message, file, suite) => PublicReportingAPI.log(LOG_LEVELS.FATAL, message, file, suite),
};

module.exports = PublicReportingAPI;