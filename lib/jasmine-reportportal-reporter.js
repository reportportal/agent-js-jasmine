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

const { EVENTS } = require('@reportportal/client-javascript/lib/constants/events');
const { RP_STATUSES } = require('@reportportal/client-javascript/lib/constants/statuses');
const SpecificUtils = require('./specificUtils');
const { entityType, hookTypes, hookTypesMap } = require('./constants/itemTypes');
const LOG_LEVELS = require('./constants/logLevels');
const { JasmineStatuses } = require('./constants/testStatuses');

const promiseErrorHandler = (promise) => {
    promise.catch((err) => {
        console.error(err);
    });
};

class ReportportalReporter {
    constructor(conf, onSetLaunchStatus) {
        this.client = conf.client;
        this.tempLaunchId = conf.tempLaunchId;
        this.parentsInfo = [];
        this.conf = conf;
        this.setLaunchStatus = onSetLaunchStatus;
        this.registerListeners();
        this.reportHooks();
        this.additionalCustomParams = {};
        this.suiteDescription = new Map();
        this.suiteLogs = new Map();
        this.suiteAttributes = new Map();
        this.suiteTestCaseIds = new Map();
        this.suiteStatuses = new Map();
        this.hookIds = new Map();
        this.itemStartTime = null;
        this.currentTestFilePathIndex;
    }

    reportHooks() {
        this.conf.reportHooks && this.installHooks();
    }

    escapeMarkdown(string) {
        return string.replace(/_/gm, '\\_').replace(/\*/gm, '\\*');
    }

    getParentInfo() {
        if (!this.parentsInfo.length) {
            return null;
        }

        return this.parentsInfo[this.parentsInfo.length - 1];
    }

    getParentOfParentInfo() {
        if (this.parentsInfo.length > 1) {
            return this.parentsInfo[this.parentsInfo.length - 2];
        }

        return null;
    }

    setParentInfo(info) {
        this.parentsInfo.push(info);
    }

    finishParent() {
        this.parentsInfo.pop();
    }

    getTopLevelType() {
        if (!this.parentsInfo.length) {
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
            this.additionalCustomParams = Object.assign(
                this.additionalCustomParams,
                description && { description: description.text },
            );
        }
    }

    setTestCaseId(testCase) {
        if (testCase && testCase.suite) {
            this.suiteTestCaseIds.set(testCase.suite, testCase.testCaseId);
        } else {
            this.additionalCustomParams = Object.assign(
                this.additionalCustomParams,
                testCase && { testCaseId: testCase.testCaseId },
            );
        }
    }

    setStatus(data) {
        if (data && data.suite) {
            this.suiteStatuses.set(data.suite, data.status);
        } else {
            this.additionalCustomParams = Object.assign(
                this.additionalCustomParams,
                data && { customStatus: data.status },
            );
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
                : { logs: [logWithTime] };

            this.additionalCustomParams = Object.assign(this.additionalCustomParams, logs);
        }
    }

    sendLaunchLog(log) {
        this.sendLog(this.tempLaunchId, log);
    }

    sendLog(tempId, {
        level, message = '', file, time,
    }) {
        this.client.sendLog(tempId,
            {
                message,
                level,
                time: time || this.getTime(),
            },
            file);
    }

    registerListeners() {
        process.on(EVENTS.ADD_ATTRIBUTES, this.addAttributes.bind(this));
        process.on(EVENTS.SET_DESCRIPTION, this.setDescription.bind(this));
        process.on(EVENTS.SET_TEST_CASE_ID, this.setTestCaseId.bind(this));
        process.on(EVENTS.SET_STATUS, this.setStatus.bind(this));
        process.on(EVENTS.SET_LAUNCH_STATUS, this.setLaunchStatus.bind(this));
        process.on(EVENTS.ADD_LOG, this.addTestItemLog.bind(this));
        process.on(EVENTS.ADD_LAUNCH_LOG, this.sendLaunchLog.bind(this));
    }

    getSuiteAttributesBySuite(suite) {
        return this.suiteAttributes.get(suite);
    }

    getSuiteDescriptionBySuite(suite) {
        return this.suiteDescription.get(suite);
    }

    getSuiteTestCaseIdBySuite(suite) {
        return this.suiteTestCaseIds.get(suite);
    }

    getSuiteStatusBySuite(suite) {
        return this.suiteStatuses.get(suite);
    }

    getSuiteLogsBySuite(suite) {
        return this.suiteLogs.get(suite);
    }

    changeCurrentTestFilePath(suite) {
        if (this.currentTestFilePathIndex === undefined) {
            this.currentTestFilePathIndex = 0;

            return;
        }

        if (suite.description === suite.fullName) {
            this.currentTestFilePathIndex = this.currentTestFilePathIndex + 1;
        }
    }

    suiteStarted(suite) {
        this.changeCurrentTestFilePath(suite);

        const fullSuiteName = SpecificUtils.getFullTestName(suite);
        const promise = SpecificUtils.getCodeRef(this.currentTestFilePathIndex, fullSuiteName);
        const suiteTitle = suite.description;
        const attributes = this.getSuiteAttributesBySuite(suiteTitle);
        const description = this.getSuiteDescriptionBySuite(suiteTitle);
        const testCaseId = this.getSuiteTestCaseIdBySuite(suiteTitle);
        const logs = this.getSuiteLogsBySuite(suiteTitle);

        const type = this.getTopLevelType();

        return promise.then((codeRef) => {
            this.itemStartTime = this.getTime();
            const parent = this.getParentInfo();
            const suiteObj = this.client.startTestItem(Object.assign({
                type,
                description: suiteTitle,
                startTime: this.itemStartTime,
                name: suiteTitle,
            },
            attributes && { attributes },
            description && { description },
            testCaseId && { testCaseId },
            codeRef && { codeRef }), this.tempLaunchId, parent && parent.tempId);

            this.setParentInfo({ tempId: suiteObj.tempId, startTime: this.itemStartTime });
            logs && logs.forEach(log => this.sendLog(suiteObj.tempId, log));
            promiseErrorHandler(suiteObj.promise);

            this.additionalCustomParams = {};
            this.suiteAttributes.delete(suiteTitle);
            this.suiteDescription.delete(suiteTitle);
            this.suiteTestCaseIds.delete(suiteTitle);
            this.suiteLogs.delete(suiteTitle);
        });
    }

    specStarted(spec) {
        const fullTestName = SpecificUtils.getFullTestName(spec);
        const promise = SpecificUtils.getCodeRef(this.currentTestFilePathIndex, fullTestName);

        return promise.then((codeRef) => {
            this.itemStartTime = this.getTime();
            const parent = this.getParentInfo();
            const stepObj = this.client.startTestItem(Object.assign({
                type: entityType.STEP,
                description: spec.description,
                startTime: this.itemStartTime,
                name: spec.description,
            }, codeRef && { codeRef }), this.tempLaunchId, parent && parent.tempId);

            this.setParentInfo({ tempId: stepObj.tempId, startTime: this.itemStartTime });
            promiseErrorHandler(stepObj.promise);
        });
    }

    getHookStartTime(hookType, parent) {
        if (hookType === entityType.BEFORE_METHOD || hookType === entityType.BEFORE_SUITE) {
            return Math.max(parent && parent.startTime, this.itemStartTime - 1);
        }
        return this.itemStartTime || this.getTime();
    }

    hookStarted(hook) {
        const parent = this.getParentOfParentInfo();
        const type = hookTypesMap[hook];
        const startTime = this.getHookStartTime(type, parent);
        const hookObj = this.client.startTestItem({
            type,
            startTime,
            name: hook,
        }, this.tempLaunchId, parent && parent.tempId);

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
                status: RPStatus || RP_STATUSES.PASSED,
                endTime: this.getTime(),
            });

            promiseErrorHandler(hookDonePromise.promise);
        }
    }

    specDone(spec) {
        const {
            attributes, description, testCaseId, logs = [], customStatus,
        } = this.additionalCustomParams;
        let status = customStatus || spec.status;
        if (status === JasmineStatuses.PENDING || status === JasmineStatuses.DISABLED) {
            status = RP_STATUSES.SKIPPED;
        }
        let level = '';
        let message = spec.fullName;
        if (status === RP_STATUSES.FAILED) {
            level = LOG_LEVELS.ERROR;
            const failures = [];
            spec.failedExpectations.forEach((failure) => {
                failures.push(`message: ${this.escapeMarkdown(failure.message)}`);
                failures.push(`stackTrace: ${this.escapeMarkdown(failure.stack)}`);
            });
            message = failures.join('\n');
        }
        const parent = this.getParentInfo();
        let promise = Promise.resolve(null);
        if (this.conf.attachPicturesToLogs) {
            promise = SpecificUtils.takeScreenshot(spec.fullName);
        }

        return promise.then((fileObj) => {
            const allLogs = [{ message, level, file: fileObj }].concat(logs);
            const issue = (status === RP_STATUSES.SKIPPED && this.conf.skippedIssue === false)
                ? { issueType: 'NOT_ISSUE' }
                : null;

            allLogs && allLogs.forEach(log => this.sendLog(parent && parent.tempId, log));

            const finishTestItemPromise = this.client.finishTestItem(parent && parent.tempId, Object.assign({
                status,
            },
            attributes && { attributes },
            description && { description },
            testCaseId && { testCaseId },
            issue && { issue }));
            promiseErrorHandler(finishTestItemPromise.promise);

            this.additionalCustomParams = {};
            this.finishParent();
            this.itemStartTime = null;
        });
    }

    suiteDone(suite) {
        const status = this.getSuiteStatusBySuite(suite.description);
        const parent = this.getParentInfo();

        const suiteDonePromise = this.client.finishTestItem(parent && parent.tempId,
            Object.assign({}, status && { status }));

        promiseErrorHandler(suiteDonePromise.promise);
        this.finishParent();
        this.suiteStatuses.delete(suite.description);
        this.itemStartTime = null;
    }

    installHooks() {
        const jasmineBeforeAll = global.beforeAll;
        const jasmineAfterAll = global.afterAll;
        const jasmineBeforeEach = global.beforeEach;
        const jasmineAfterEach = global.afterEach;

        const wrapperBeforeAll = SpecificUtils.makeHooksWrapper(
            jasmineBeforeAll,
            () => this.hookStarted(hookTypes.BEFORE_ALL),
            (status, err) => this.hookDone(hookTypes.BEFORE_ALL, status, err),
        );
        const wrapperAfterAll = SpecificUtils.makeHooksWrapper(
            jasmineAfterAll,
            () => this.hookStarted(hookTypes.AFTER_ALL),
            (status, err) => this.hookDone(hookTypes.AFTER_ALL, status, err),
        );
        const wrapperBeforeEach = SpecificUtils.makeHooksWrapper(
            jasmineBeforeEach,
            () => this.hookStarted(hookTypes.BEFORE_EACH),
            (status, err) => this.hookDone(hookTypes.BEFORE_EACH, status, err),
        );
        const wrapperAfterEach = SpecificUtils.makeHooksWrapper(
            jasmineAfterEach,
            () => this.hookStarted(hookTypes.AFTER_EACH),
            (status, err) => this.hookDone(hookTypes.AFTER_EACH, status, err),
        );

        global.beforeAll = wrapperBeforeAll;
        global.afterAll = wrapperAfterAll;
        global.beforeEach = wrapperBeforeEach;
        global.afterEach = wrapperAfterEach;
    }
}

module.exports = ReportportalReporter;
