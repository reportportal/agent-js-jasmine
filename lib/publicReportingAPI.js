const ClientPublicReportingAPI = require('reportportal-client/lib/publicReportingAPI');
const { RP_STATUSES } = require('reportportal-client/lib/constants/statuses');
const LOG_LEVELS = require('./constants/logLevels');

const PublicReportingAPI = {
    addAttributes: (attributes, suite) =>
        ClientPublicReportingAPI.addAttributes(attributes, suite),
    setDescription: (text, suite) =>
        ClientPublicReportingAPI.setDescription(text, suite),
    setTestCaseId: (testCaseId, suite) =>
        ClientPublicReportingAPI.setTestCaseId(testCaseId, suite),
    setStatus: (status, suite) =>
        ClientPublicReportingAPI.setStatus(status, suite),
    setLaunchStatus: (status) => ClientPublicReportingAPI.setLaunchStatus(status),
    setStatusPassed: (suite) => PublicReportingAPI.setStatus(RP_STATUSES.PASSED, suite),
    setStatusFailed: (suite) => PublicReportingAPI.setStatus(RP_STATUSES.FAILED, suite),
    setStatusSkipped: (suite) => PublicReportingAPI.setStatus(RP_STATUSES.SKIPPED, suite),
    setStatusStopped: (suite) => PublicReportingAPI.setStatus(RP_STATUSES.STOPPED, suite),
    setStatusInterrupted: (suite) => PublicReportingAPI.setStatus(RP_STATUSES.INTERRUPTED, suite),
    setStatusCancelled: (suite) => PublicReportingAPI.setStatus(RP_STATUSES.CANCELLED, suite),
    setStatusInfo: (suite) => PublicReportingAPI.setStatus(RP_STATUSES.INFO, suite),
    setStatusWarn: (suite) => PublicReportingAPI.setStatus(RP_STATUSES.WARN, suite),
    setLaunchStatusPassed: () => PublicReportingAPI.setLaunchStatus(RP_STATUSES.PASSED),
    setLaunchStatusFailed: () => PublicReportingAPI.setLaunchStatus(RP_STATUSES.FAILED),
    setLaunchStatusSkipped: () => PublicReportingAPI.setLaunchStatus(RP_STATUSES.SKIPPED),
    setLaunchStatusStopped: () => PublicReportingAPI.setLaunchStatus(RP_STATUSES.STOPPED),
    setLaunchStatusInterrupted: () => PublicReportingAPI.setLaunchStatus(RP_STATUSES.INTERRUPTED),
    setLaunchStatusCancelled: () => PublicReportingAPI.setLaunchStatus(RP_STATUSES.CANCELLED),
    setLaunchStatusInfo: () => PublicReportingAPI.setLaunchStatus(RP_STATUSES.INFO),
    setLaunchStatusWarn: () => PublicReportingAPI.setLaunchStatus(RP_STATUSES.WARN),
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