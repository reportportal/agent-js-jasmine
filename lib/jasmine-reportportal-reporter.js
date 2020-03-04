const SpecificUtils = require('./specificUtils');
const { EVENTS } = require('reportportal-client/lib/events');

class ReportportalReporter {
    constructor(conf) {
        this.client = conf.client;
        this.tempLaunchId = conf.tempLaunchId;
        this.parentIds = [];
        this.conf = conf;
        this.registerListeners();
        this.additionalCustomParams = {};
    }

    escapeMarkdown(string) {
        return string.replace(/_/gm, '\\_').replace(/\*/gm, '\\*');
    }

    getParentId() {
        if (!this.parentIds.length) {
            return null;
        }
        return this.parentIds[this.parentIds.length - 1];
    }

    setParentId(id) {
        this.parentIds.push(id);
    }

    finishParent() {
        this.parentIds.pop();
    }

    getTopLevelType() {
        if (!this.parentIds.length) {
            return 'SUITE';
        }
        return 'TEST';
    }

    setAttributes(attributes) {
        this.additionalCustomParams = Object.assign(this.additionalCustomParams, attributes);
    }

    registerListeners () {
        process.on(EVENTS.ADD_ATTRIBUTES, this.setAttributes.bind(this));
    }

    jasmineStarted(info) {
    }

    suiteStarted(suite) {
        const { attributes } = this.additionalCustomParams;

        let type = this.getTopLevelType();
        let suiteObj = this.client.startTestItem(Object.assign({
            type,
            description: suite.description,
            name: suite.fullName
        }, attributes && { attributes }), this.tempLaunchId, this.getParentId());
        this.setParentId(suiteObj.tempId);
        this.additionalCustomParams = {};
        suiteObj.promise
            .catch(error=>{
                console.log(new Error(error));
            })
    }

    specStarted(spec) {
        let stepObj = this.client.startTestItem({
            type: 'STEP',
            description: spec.description,
            name: spec.fullName
        }, this.tempLaunchId, this.getParentId());
        this.setParentId(stepObj.tempId);
        stepObj.promise
            .catch(error=>{
                console.log(new Error(error));
            })
    }
    specDone(spec) {
        const { attributes } = this.additionalCustomParams;
        let status = spec.status;
        if (status === 'pending' || status === 'disabled') {
            status = 'skipped';
        }
        let level = '';
        let message = spec.fullName;
        if (status === 'failed') {
            level = 'ERROR';
            let failures = [];
            spec.failedExpectations.forEach((failure) => {
                failures.push(`message: ${this.escapeMarkdown(failure.message)}`);
                failures.push(`stackTrace: ${this.escapeMarkdown(failure.stack)}`);
            });
            message = failures.join('\n');
        }
        let parentId = this.getParentId();
        let promise = Promise.resolve(null);
        if (this.conf.attachPicturesToLogs) {
            promise = SpecificUtils.takeScreenshot(spec.fullName);
        }
        promise.then((fileObj) => {
            let sendLogPromise = this.client.sendLog(parentId, {
                message,
                level
            }, fileObj);
            sendLogPromise.promise
                .catch(error=>{
                    console.log(new Error(error));
                });
            let finishTestItemPromise = this.client.finishTestItem(parentId, Object.assign({
                status
            }, attributes && { attributes }));
            finishTestItemPromise.promise
                .catch(error=>{
                    console.log(new Error(error));
                });
        });

        this.additionalCustomParams = {};
        this.finishParent();
    }

    suiteDone(suite) {
        let suiteDonePromise = this.client.finishTestItem(this.getParentId(), {});
        suiteDonePromise.promise
            .catch(error=>{
                console.log(new Error(error));
            });
        this.finishParent();
    }

    jasmineDone() {
    }
}

module.exports = ReportportalReporter;