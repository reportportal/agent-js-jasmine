const ReportportalClient = require('reportportal-client');
const JasmineReportportalReporter = require('./jasmine-reportportal-reporter.js');

class ReportportalAgent {
    constructor(conf) {
        let config = Object.assign({
            token: '',
            endpoint: '',
            project: '',
        }, conf);
        this.client = new ReportportalClient(config);
        this.tempLaunchId = (this.client.startLaunch({})).tempId;
        this.reporterConf = Object.assign({
            client: this.client,
            tempLaunchId: this.tempLaunchId,
            attachPicturesToLogs: true
        }, conf);
    }
    getJasmineReporter() {
        return new JasmineReportportalReporter(this.reporterConf);
    }
    getExitPromise() {
        return (this.client.finishLaunch(this.tempLaunchId, {})).promise;
    }
}

module.exports = ReportportalAgent;
