const ReportportalClient = require('reportportal-client');
const JasmineReportportalReporter = require('./jasmine-reportportal-reporter.js');

class ReportportalAgent {
    constructor(conf) {
        const config = Object.assign({
            token: '',
            endpoint: '',
            project: '',
        }, conf);
        const launchObj =  Object.assign(
            {
                attributes: conf.attributes, description: conf.description
            },
            conf.id && { id: conf.id },
            conf.rerun && { rerun: conf.rerun },
            conf.rerunOf && { rerunOf: conf.rerunOf }
        );

        this.client = new ReportportalClient(config);
        this.launchInstance = this.client.startLaunch(launchObj);
        this.tempLaunchId = this.launchInstance.tempId
        this.reporterConf = Object.assign({
            client: this.client,
            tempLaunchId: this.tempLaunchId,
            attachPicturesToLogs: true
        }, conf);
    }

    getJasmineReporter() {
        return new JasmineReportportalReporter(this.reporterConf);
    }

    /*
     * This method is used for launch finish when test run in one thread, and if test run in
     * multi treading it must be call at the parent process ONLY, after all child processes have
     * been finished
     *
     * @return a promise
     */
    getExitPromise() {
        return (this.client.finishLaunch(this.tempLaunchId, {})).promise;
    }

    /*
     * This method is used for creating a Parent Launch at the Report Portal in which child launches would
     *  send their data
     *  during the promise resolve id of the launch could be ejected and sent as @param
     *  to the child launches.
     *
     *   @return a promise
     */
    getLaunchStartPromise() {
        return  this.launchInstance.promise
    }

    /*
     * This method is used for frameworks as Jasmine and other. There is problems when
     * it doesn't wait for promise resolve and stop the process. So it better to call
     * this method at the spec's function as @afterAll() and manually resolve this promise.
     *
     * @return a promise
     */
    getPromiseFinishAllItems(launchTempId){
        return this.client.getPromiseFinishAllItems(launchTempId)
    }
}

module.exports = ReportportalAgent;
