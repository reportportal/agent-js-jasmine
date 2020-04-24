const SpecificUtils = require('./specificUtils');
const { EVENTS } = require('reportportal-client/lib/events');
const { entityType, hookTypes, hookTypesMap } = require('./constants/itemTypes');
const LOG_LEVELS = require('./constants/logLevels');
const { RPStatuses, JasmineStatuses } = require('./constants/testStatuses');

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
        this.reportHooks();
        this.additionalCustomParams = {};
        this.suiteDescription = new Map();
        this.suiteLogs = new Map();
        this.suiteAttributes = new Map();
        this.hookIds = new Map();
        this.startTime = null;
    }

    reportHooks() {
        this.conf.reportHooks && this.installHooks();
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

    getParentOfParentId() {
        if (this.parentIds.length > 1) {
            return this.parentIds[this.parentIds.length - 2];
        }

        return null;
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
        const logWithTime = Object.assign(testItemLog.log, { time: this.getTime() });

        if (testItemLog && testItemLog.suite) {
            const logs = (this.suiteLogs.get(testItemLog.suite) || []).concat([logWithTime]);

            this.suiteLogs.set(testItemLog.suite, logs);
        } else {
            const logs = this.additionalCustomParams.logs
                ? { logs: this.additionalCustomParams.logs.concat([logWithTime]) }
                : { logs: [logWithTime]};

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
        this.startTime = this.getTime() - 1;
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
        this.startTime = this.getTime() - 1;
        let stepObj = this.client.startTestItem({
            type: entityType.STEP,
            description: spec.description,
            name: spec.fullName
        }, this.tempLaunchId, this.getParentId());
        this.setParentId(stepObj.tempId);
        promiseErrorHandler(stepObj.promise);
    }

    hookStarted(hook) {
        const parent = this.getParentOfParentId();
        const hookObj = this.client.startTestItem({
            type: hookTypesMap[hook],
            startTime: this.startTime || this.getTime(),
            name: hook
        }, this.tempLaunchId, parent);

        this.hookIds.set(hook, hookObj.tempId);
        promiseErrorHandler(hookObj.promise);
    }

    hookDone(hook, RPStatus, err) {
        const hookId = this.hookIds.get(hook);

        if (hookId) {
            this.hookIds.delete(hook);
            if (err) {
                const log = { message: `message: ${err}`, level: LOG_LEVELS.ERROR };

                this.sendLog(hookId, log);
            }
            const hookDonePromise = this.client.finishTestItem(hookId, {
                status: RPStatus || RPStatuses.PASSED,
                endTime: this.getTime(),
            });

            promiseErrorHandler(hookDonePromise.promise);
        }
        this.startTime = null;
    }

    specDone(spec) {
        const { attributes, description, logs = [] } = this.additionalCustomParams;
        let status = spec.status;
        if (status === JasmineStatuses.PENDING || status === JasmineStatuses.DISABLED) {
            status = RPStatuses.SKIPPED;
        }
        let level = '';
        let message = spec.fullName;
        if (status === RPStatuses.FAILED) {
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
        this.startTime = null;
    }

    suiteDone() {
        let suiteDonePromise = this.client.finishTestItem(this.getParentId(), {});

        promiseErrorHandler(suiteDonePromise.promise);
        this.finishParent();
        this.startTime = null;
    }

    installHooks() {
        const jasmineBeforeAll = global.beforeAll;
        const jasmineAfterAll = global.afterAll;
        const jasmineBeforeEach = global.beforeEach;
        const jasmineAfterEach = global.afterEach;

        const wrapperBeforeAll =
            SpecificUtils.makeHooksWrapper(jasmineBeforeAll, () => this.hookStarted(hookTypes.BEFORE_ALL), (status, err) => this.hookDone(hookTypes.BEFORE_ALL, status, err));
        const wrapperAfterAll =
            SpecificUtils.makeHooksWrapper(jasmineAfterAll, () => this.hookStarted(hookTypes.AFTER_ALL), (status, err) => this.hookDone(hookTypes.AFTER_ALL, status, err));
        const wrapperBeforeEach =
            SpecificUtils.makeHooksWrapper(jasmineBeforeEach, () => this.hookStarted(hookTypes.BEFORE_EACH), (status, err) => this.hookDone(hookTypes.BEFORE_EACH, status, err));
        const wrapperAfterEach =
            SpecificUtils.makeHooksWrapper(jasmineAfterEach, () => this.hookStarted(hookTypes.AFTER_EACH), (status, err) => this.hookDone(hookTypes.AFTER_EACH, status, err));

        global.beforeAll = wrapperBeforeAll;
        global.afterAll = wrapperAfterAll;
        global.beforeEach = wrapperBeforeEach;
        global.afterEach = wrapperAfterEach;
    }
}

module.exports = ReportportalReporter;