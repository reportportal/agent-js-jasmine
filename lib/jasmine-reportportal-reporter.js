const SpecificUtils = require('./specificUtils');
const { EVENTS } = require('reportportal-client/lib/events');
const { entityType } = require('./constants/itemTypes');
const LOG_LEVELS = require('./constants/logLevels');
const TEST_STATUSES = require('./constants/testStatuses');

const promiseErrorHandler = promise => {
    promise.catch(err => {
        console.error(err);
    });
};

class ReportportalReporter {
    constructor(conf) {
        this.client = conf.client;
        this.tempLaunchId = conf.tempLaunchId;
        this.parentIds = [];
        this.conf = conf;
        this.registerListeners();
        this.additionalCustomParams = {};
        this.suiteDescription = new Map();
        this.suiteLogs = new Map();
        this.suiteAttributes = new Map();
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
            return entityType.SUITE;
        }
        return entityType.TEST;
    }

    getTime() {
        return new Date().valueOf();
    }

    addAttributes(attr) {
        if (attr && attr.suite) {
            const attributes = (this.suiteAttributes.get(attr.suite) || []).concat(attr.attributes);

            this.suiteAttributes.set(attr.suite, attributes);
        } else {
            const attributes = this.additionalCustomParams.attributes
                ? { attributes: this.additionalCustomParams.attributes.concat(attr.attributes) }
                : attr;

            this.additionalCustomParams = Object.assign(this.additionalCustomParams, attributes);
        }
    }

    setDescription(description) {
        if (description && description.suite) {
            this.suiteDescription.set(description.suite, description.text);
        } else {
            this.additionalCustomParams = Object.assign(this.additionalCustomParams, description && { description: description.text });
        }
    }

    addTestItemLog(testItemLog) {
        if (testItemLog && testItemLog.suite) {
            const logs = (this.suiteLogs.get(testItemLog.suite) || []).concat([Object.assign(testItemLog.log, { time: this.getTime() })]);

            this.suiteLogs.set(testItemLog.suite, logs);
        } else {
            const logs = this.additionalCustomParams.logs
                ? { logs: this.additionalCustomParams.logs.concat([testItemLog.log]) }
                : { logs: [testItemLog.log]};

            this.additionalCustomParams = Object.assign(this.additionalCustomParams, logs);
        }
    }

    sendLaunchLog(log) {
        this.sendLog(this.tempLaunchId, log);
    }

    sendLog(tempId, { level, message = '', file, time }) {
        this.client.sendLog(tempId,
            {
                message,
                level,
                time: time || this.getTime()
            },
            file
        );
    }

    registerListeners () {
        process.on(EVENTS.ADD_ATTRIBUTES, this.addAttributes.bind(this));
        process.on(EVENTS.SET_DESCRIPTION, this.setDescription.bind(this));
        process.on(EVENTS.ADD_LOG, this.addTestItemLog.bind(this));
        process.on(EVENTS.ADD_LAUNCH_LOG, this.sendLaunchLog.bind(this));
    }

    getSuiteAttributesBySuite (suite) {
        return this.suiteAttributes.get(suite);
    }

    getSuiteDescriptionBySuite (suite) {
        return this.suiteDescription.get(suite);
    }

    getSuiteLogsBySuite (suite) {
        return this.suiteLogs.get(suite);
    }

    suiteStarted(suite) {
        const suiteTitle = suite.description;

        const attributes = this.getSuiteAttributesBySuite(suiteTitle);
        const description = this.getSuiteDescriptionBySuite(suiteTitle);
        const logs = this.getSuiteLogsBySuite(suiteTitle);

        let type = this.getTopLevelType();
        let suiteObj = this.client.startTestItem(Object.assign({
            type,
            description: suiteTitle,
            name: suite.fullName
        },
            attributes && { attributes },
            description && { description }), this.tempLaunchId, this.getParentId());
        this.setParentId(suiteObj.tempId);

        logs && logs.forEach(log => this.sendLog(suiteObj.tempId, log));

        this.additionalCustomParams = {};
        this.suiteAttributes.delete(suiteTitle);
        this.suiteDescription.delete(suiteTitle);
        this.suiteLogs.delete(suiteTitle);

        promiseErrorHandler(suiteObj.promise);
    }

    specStarted(spec) {
        let stepObj = this.client.startTestItem({
            type: entityType.STEP,
            description: spec.description,
            name: spec.fullName
        }, this.tempLaunchId, this.getParentId());
        this.setParentId(stepObj.tempId);
        promiseErrorHandler(stepObj.promise);
    }

    specDone(spec) {
        const { attributes, description, logs = [] } = this.additionalCustomParams;
        let status = spec.status;
        if (status === TEST_STATUSES.PENDING || status === TEST_STATUSES.DISABLED) {
            status = TEST_STATUSES.SKIPPED;
        }
        let level = '';
        let message = spec.fullName;
        if (status === TEST_STATUSES.FAILED) {
            level = LOG_LEVELS.ERROR;
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
            const allLogs = [{ message, level, file: fileObj }].concat(logs);

            allLogs && allLogs.forEach(log => this.sendLog(parentId, log));

            let finishTestItemPromise = this.client.finishTestItem(parentId, Object.assign({
                status
            }, attributes && { attributes }, description && { description }));
            promiseErrorHandler(finishTestItemPromise.promise);
        });

        this.additionalCustomParams = {};
        this.finishParent();
    }

    suiteDone() {
        let suiteDonePromise = this.client.finishTestItem(this.getParentId(), {});

        promiseErrorHandler(suiteDonePromise.promise);
        this.finishParent();
    }
}

module.exports = ReportportalReporter;