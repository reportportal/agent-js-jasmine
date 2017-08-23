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
        this.tempLaunchId = conf.id ? (this.client.startLaunch({id: conf.id})).tempId : null;
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

    /*
     * This method is used for creating a Parent Launch at the Report Portal in which child launches would
     *  send their data
     *  during the promise resolve id of the launch could be ejected and sent as @param
     *  to the child launches.
     *
     *   @Returns a promise
     */
    startParentLaunch() {
        const launchObj = (this.client.startLaunch({}));
        this.tempLaunchId = launchObj.tempId;
        return launchObj.promise
    }
}

module.exports = ReportportalAgent;
