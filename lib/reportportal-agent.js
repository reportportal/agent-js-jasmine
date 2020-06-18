/*
 *  Copyright 2020 EPAM Systems
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const RPClient = require('@reportportal/client-javascript');
const JasmineReportportalReporter = require('./jasmine-reportportal-reporter.js');
const SpecificUtils = require('./specificUtils');

class ReportportalAgent {
    constructor(conf) {
        const config = Object.assign({
            token: '',
            endpoint: '',
            project: '',
        }, conf);
        const agentInfo = SpecificUtils.getAgentInfo();
        const launchObj = SpecificUtils.getLaunchObj(conf);
        this.client = new RPClient(config, agentInfo);
        this.launchInstance = this.client.startLaunch(launchObj);
        this.tempLaunchId = this.launchInstance.tempId;
        this.launchStatus;
        this.reporterConf = Object.assign({
            client: this.client,
            tempLaunchId: this.tempLaunchId,
            attachPicturesToLogs: true,
        }, conf);
    }

    setLaunchStatus(status) {
        this.launchStatus = status;
    }

    getJasmineReporter() {
        return new JasmineReportportalReporter(this.reporterConf, this.setLaunchStatus.bind(this));
    }

    /*
     * This method is used for launch finish when test run in one thread, and if test run in
     * multi treading it must be call at the parent process ONLY, after all child processes have
     * been finished
     *
     * @return a promise
     */
    getExitPromise() {
        const status = this.launchStatus;

        return (this.client.finishLaunch(this.tempLaunchId, Object.assign({}, status && { status }))).promise;
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
        return this.launchInstance.promise;
    }

    /*
     * This method is used for frameworks as Jasmine and other. There is problems when
     * it doesn't wait for promise resolve and stop the process. So it better to call
     * this method at the spec's function as @afterAll() and manually resolve this promise.
     *
     * @return a promise
     */
    getPromiseFinishAllItems(launchTempId) {
        return this.client.getPromiseFinishAllItems(launchTempId);
    }
}

module.exports = ReportportalAgent;
