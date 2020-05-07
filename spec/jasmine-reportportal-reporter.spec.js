describe('jasmine Report Portal reporter', function() {
    const Reporter = require('../lib/jasmine-reportportal-reporter');
    const SpecificUtils = require('../lib/specificUtils');

    let reporter;
    let tempLaunchId = 'ewrf35432r';
    let promise;
    let baseTime;

    beforeEach(function() {
        let client = {
            startTestItem() {},
            finishTestItem() {},
            sendLog() {},
        };
        baseTime = new Date(2020, 4, 8);

        jasmine.clock().mockDate(baseTime);
        reporter = new Reporter({
            client: client,
            tempLaunchId: tempLaunchId,
        });
    });

    afterEach(function () {
        promise = null;
        reporter.parentIds = [];
        reporter.hookIds = null;
        reporter.additionalCustomParams = {};
        reporter.conf.attachPicturesToLogs = false;
        reporter.conf.reportHooks = false;
    });

    it('should be properly initialized', function() {
        expect(reporter.parentIds.length).toBe(0);
    });

    it('should escape markdown', function() {
        const escapeString = reporter.escapeMarkdown('_test*');

        expect(escapeString).toBe('\\_test\\*');
    });

    describe('reportHooks', function () {
        it('should called installHooks method if conf.reportHooks is true', function() {
            spyOn(reporter, 'installHooks');
            reporter.conf.reportHooks = true;

            reporter.reportHooks();

            expect(reporter.installHooks).toHaveBeenCalled();
        });

        it('should not called installHooks method if conf.reportHooks is false', function() {
            spyOn(reporter, 'installHooks');
            reporter.conf.reportHooks = false;

            reporter.reportHooks();

            expect(reporter.installHooks).not.toHaveBeenCalled();
        });
    });

    describe('getParentId', function () {
        it('should return null if getParentId is empty', function() {
            reporter.parentIds = [];

            const parent = reporter.getParentId();

            expect(parent).toEqual(null);
        });

        it('should return last parent if there is no number as parameter', function() {
            reporter.parentIds = [1, 2, 3];

            const parent = reporter.getParentId();

            expect(parent).toEqual(3);
        });
    });

    describe('getParentOfParentId', function () {
        it('should return null if this.parentIds is empty', function() {
            reporter.parentIds = [];

            const parent = reporter.getParentOfParentId();

            expect(parent).toEqual(null);
        });

        it('should return null if this.parentIds.length less then 2', function() {
            reporter.parentIds = [1];

            const parent = reporter.getParentOfParentId();

            expect(parent).toEqual(null);
        });

        it('should return correct parent if this.parentIds.length more then 1', function() {
            reporter.parentIds = [1, 2];

            const parent = reporter.getParentOfParentId();

            expect(parent).toEqual(1);
        });
    });

    describe('addAttributes', function () {
        it('additionalCustomParams should not be empty if addAttributes\' parameter is not empty', function () {
            const expectedAdditionalCustomParams = {
                customParams: 'value',
                attributes: [
                    { key: 'key', value: 'value' },
                    { key: 'key1', value: 'value2' }
                ]
            };
            reporter.additionalCustomParams = { customParams: 'value' };

            reporter.addAttributes({ attributes: [{ key: 'key', value: 'value' }, { key: 'key1', value: 'value2' }]});

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('additionalCustomParams should be correct if we call addAttributes with attributes few times', function () {
            const expectedAdditionalCustomParams = {
                attributes: [
                    { key: 'key', value: 'value' },
                    { key: 'key1', value: 'value1' },
                    { key: 'key2', value: 'value2' }
                ]
            };
            reporter.additionalCustomParams = { attributes: [{ key: 'key', value: 'value' }] };

            reporter.addAttributes({ attributes: [{ key: 'key1', value: 'value1' }]});
            reporter.addAttributes({ attributes: [{ key: 'key2', value: 'value2' }]});

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('additionalCustomParams should be empty if addAttributes\' parameter and additionalCustomParams are empty', function () {
            const expectedAdditionalCustomParams = {};
            reporter.additionalCustomParams = {};

            reporter.addAttributes();

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('suiteAttributes should not be empty if addAttributes\' parameter has suite property', function () {
            const attributes = [{
                key: 'key',
                value: 'value',
            }];
            const expectedSuiteAttributes = new Map([['suite', attributes]]);

            reporter.addAttributes({ attributes, suite: 'suite' });

            expect(reporter.suiteAttributes).toEqual(expectedSuiteAttributes);
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('suiteAttributes should be correct if addAttributes\' parameter has suite property and we call addAttributes few times', function () {
            const attributesOne = [{
                key: 'keyOne',
                value: 'valueOne',
            }];
            const attributesTwo = [{
                key: 'keyTwo',
                value: 'valueTwo',
            }];
            const expectedSuiteAttributes = new Map([['suite', attributesOne.concat(attributesTwo)]]);

            reporter.addAttributes({ attributes: attributesOne, suite: 'suite' });
            reporter.addAttributes({ attributes: attributesTwo, suite: 'suite' });

            expect(reporter.suiteAttributes).toEqual(expectedSuiteAttributes);
            expect(reporter.additionalCustomParams).toEqual({});
        });
    });

    describe('setDescription', function () {
        it('additionalCustomParams should not be empty if setDescription\' parameter is not empty', function () {
            const expectedAdditionalCustomParams = {
                customParams: 'value',
                description: 'text description'
            };
            reporter.additionalCustomParams = { customParams: 'value' };

            reporter.setDescription({ text: 'text description' });

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('suiteDescription should not be empty if setDescription\' parameter has suite property', function () {
            const expectedSuiteDescription = new Map([['suite', 'text description']]);

            reporter.setDescription({ text: 'text description', suite: 'suite' });

            expect(reporter.suiteDescription).toEqual(expectedSuiteDescription);
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('additionalCustomParams should be empty if setDescription\' parameter and additionalCustomParams are empty', function () {
            const expectedAdditionalCustomParams = {};
            reporter.additionalCustomParams = {};

            reporter.setDescription();

            expect(reporter.additionalCustomParams).toEqual(expectedAdditionalCustomParams);
        });
    });

    describe('setTestCaseId', function () {
        it('additionalCustomParams should not be empty if setTestCaseId\' parameter is not empty', function () {
            const expectedAdditionalCustomParams = {
                customParams: 'value',
                testCaseId: 'testCaseId'
            };
            reporter.additionalCustomParams = { customParams: 'value' };

            reporter.setTestCaseId({ testCaseId: 'testCaseId' });

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('suiteTestCaseIds should not be empty if setTestCaseId\' parameter has suite property', function () {
            const expectedSuiteTestCaseIds = new Map([['suite', 'testCaseId']]);

            reporter.setTestCaseId({ testCaseId: 'testCaseId', suite: 'suite' });

            expect(reporter.suiteTestCaseIds).toEqual(expectedSuiteTestCaseIds);
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('additionalCustomParams should be empty if setTestCaseId\' parameter and additionalCustomParams are empty', function () {
            const expectedAdditionalCustomParams = {};
            reporter.additionalCustomParams = {};

            reporter.setTestCaseId();

            expect(reporter.additionalCustomParams).toEqual(expectedAdditionalCustomParams);
        });
    });

    describe('addTestItemLog', function () {
        it('additionalCustomParams should not be empty if addTestItemLog\' parameter is not empty', function () {
            const expectedAdditionalCustomParams = {
                customParams: 'value',
                logs: [{
                    level: 'level',
                    file: null,
                    message: 'message',
                    time: baseTime.valueOf()
                }]
            };
            reporter.additionalCustomParams = { customParams: 'value' };

            reporter.addTestItemLog({ log: { level: 'level', file: null, message: 'message' } });

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('additionalCustomParams should be correct if we call addTestItemLog with logs few times', function () {
            const expectedAdditionalCustomParams = {
                logs: [
                    { level: 'level', file: null, message: 'message', time: baseTime.valueOf() },
                    { level: 'level1', file: null, message: 'message1', time: baseTime.valueOf() }
                ]
            };

            reporter.addTestItemLog({ log: { level: 'level', file: null, message: 'message' } });
            reporter.addTestItemLog({ log: { level: 'level1', file: null, message: 'message1' } });

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('suiteLogs should not be empty if addTestItemLog\' parameter has suite property', function () {
            const logs = { level: 'level', file: null, message: 'message' };
            const expectedSuiteLogs = new Map([['suite', [logs]]]);

            reporter.addTestItemLog({ log: logs, suite: 'suite' });

            expect(reporter.suiteLogs).toEqual(expectedSuiteLogs);
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('suiteLogs should be correct if addTestItemLog\' parameter has suite property and we call addTestItemLog few times', function () {
            const logsOne = { level: 'levelOne', file: null, message: 'message one' };
            const logsTwo = { level: 'levelTwo', file: null, message: 'message two' };
            const expectedSuiteLogs = new Map([['suite', [logsOne].concat([logsTwo])]]);

            reporter.addTestItemLog({ log: logsOne, suite: 'suite' });
            reporter.addTestItemLog({ log: logsTwo, suite: 'suite' });

            expect(reporter.suiteLogs).toEqual(expectedSuiteLogs);
            expect(reporter.additionalCustomParams).toEqual({});
        });
    });

    describe('sendLaunchLog', function () {
        it('should call sendLog with tempLaunchId and log', function () {
            const log = { level: 'level', file: null, message: 'message' };
            spyOn(reporter, 'sendLog');

            reporter.sendLaunchLog(log);

            expect(reporter.sendLog).toHaveBeenCalledWith(tempLaunchId, log);
        });
    });

    describe('sendLog', function () {
        it('should call client.sendLog with correct parameters', function () {
            const log = { level: 'level', file: null, message: 'message' };
            spyOn(reporter.client, 'sendLog');

            reporter.sendLog(tempLaunchId, log);

            expect(reporter.client.sendLog).toHaveBeenCalledWith(tempLaunchId, {
                message: 'message',
                level: 'level',
                time: baseTime.valueOf()
            }, null);
        });

        it('should call client.sendLog with default parameters if sendLog doesn\'t have all parameter', function () {
            const log = { level: 'level' };
            spyOn(reporter.client, 'sendLog');

            reporter.sendLog(tempLaunchId, log);

            expect(reporter.client.sendLog).toHaveBeenCalledWith(tempLaunchId, {
                message: '',
                level: 'level',
                time: baseTime.valueOf()
            }, undefined);
        });
    });

    describe('getSuiteAttributesBySuite', function () {
        it('should return correct array of suiteAttributes', function () {
            const attributes = [{
                key: 'key',
                value: 'value',
            }];
            reporter.suiteAttributes = new Map([['suite', attributes]]);

            const suiteAttributes = reporter.getSuiteAttributesBySuite('suite');

            expect(suiteAttributes).toEqual([{ key: 'key', value: 'value' }]);
        });

        it('should return undefined if there is no suitable suite', function () {
            const attributes = [{
                key: 'key',
                value: 'value',
            }];
            reporter.suiteAttributes = new Map([['suite', attributes]]);

            const suiteAttributes = reporter.getSuiteAttributesBySuite('suite1');

            expect(suiteAttributes).toEqual(undefined);
        });
    });

    describe('getSuiteDescriptionBySuite', function () {
        it('should return correct array of suiteDescription', function () {
            reporter.suiteDescription = new Map([['suite', 'text']]);

            const suiteDescription = reporter.getSuiteDescriptionBySuite('suite');

            expect(suiteDescription).toEqual('text');
        });

        it('should return undefined if there is no suitable suite', function () {
            reporter.suiteDescription = new Map([['suite', 'text']]);

            const suiteDescription = reporter.getSuiteDescriptionBySuite('suite1');

            expect(suiteDescription).toEqual(undefined);
        });
    });

    describe('getTopLevelType', function () {
        it('should return level type \'test\' if parentIds is not empty', function () {
            reporter.parentIds = [0, 1];

            const levelType = reporter.getTopLevelType();

            expect(levelType).toBe('test');
        });

        it('should return level type \'suite\' if parentIds is empty', function () {
            reporter.parentIds = [];

            const levelType = reporter.getTopLevelType();

            expect(levelType).toBe('suite');
        });
    });

    describe('suiteStarted', function() {
        it('should send a request to the agent', function() {
            const attributes = [{
                key: 'key',
                value: 'value',
            }];
            const logs = [{
                level: 'level', file: null, message: 'message'
            }, {
                level: 'level', file: null, message: 'message'
            }];
            reporter.suiteAttributes = new Map([['suite', attributes]]);
            reporter.suiteDescription = new Map([['suite', 'text description']]);
            reporter.suiteTestCaseIds = new Map([['suite', 'testCaseId']]);
            reporter.suiteLogs = new Map([['suite', logs]]);
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452',
				promise: Promise.resolve()
            });
            spyOn(reporter, 'sendLog');

            reporter.suiteStarted({
                description: 'suite',
                fullName: 'test name'
            });

            expect(reporter.client.startTestItem).toHaveBeenCalledWith({
                type: 'suite',
                name: 'test name',
                attributes: [{ key: 'key', value: 'value' }],
                description: 'text description',
                testCaseId: 'testCaseId'
            }, tempLaunchId, null);
            expect(reporter.sendLog).toHaveBeenCalledTimes(2);
            expect(reporter.sendLog).toHaveBeenCalledWith('3452', logs[0]);
            expect(reporter.sendLog).toHaveBeenCalledWith('3452', logs[1]);
        });

        it('should create an element in parentIds', function() {
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452',
                promise: Promise.resolve()
            });

            reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });

            expect(reporter.parentIds.length).toBe(1);
        });
    });

    describe('specStarted', function() {
        it('should send a request to the agent', function() {
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452',
                promise: Promise.resolve()
            });

            reporter.specStarted({
                description: 'test description',
                fullName: 'test name'
            });

            expect(reporter.client.startTestItem).toHaveBeenCalledWith({
                type: 'step',
                description: 'test description',
                name: 'test name'
            }, tempLaunchId, null);
        });

        it('should call setParentId with the appropriate parameter', function() {
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452',
                promise: Promise.resolve()
            });
            spyOn(reporter, 'setParentId');

            reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });

            expect(reporter.setParentId).toHaveBeenCalledWith('3452');
        });
    });

    describe('hookStarted', function() {
        it('should send a request to the agent, hookIds should be correct', function() {
            const expectedHookIds = new Map([['beforeAll', '3452']]);
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452',
                promise: Promise.resolve()
            });

            reporter.hookStarted('beforeAll');

            expect(reporter.client.startTestItem).toHaveBeenCalledWith({
                type: 'BEFORE_SUITE',
                startTime: baseTime.valueOf(),
                name: 'beforeAll'
            }, tempLaunchId, null);
            expect(reporter.hookIds).toEqual(expectedHookIds);
        });
    });

    describe('hookDone', function() {
        it('should call finishTestItem with status PASSED if there is no status in parameter', function() {
            reporter.hookIds = new Map([['beforeAll', '3452']]);
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.hookDone('beforeAll');

            expect(reporter.client.finishTestItem).toHaveBeenCalledWith('3452', {
                status: 'passed',
                endTime: baseTime.valueOf(),
            });
            expect(reporter.startTime).toEqual(null);
        });

        it('should call finishTestItem with status FAILED if it gets from parameter', function() {
            reporter.hookIds = new Map([['beforeAll', '3452']]);
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.hookDone('beforeAll', 'failed');

            expect(reporter.client.finishTestItem).toHaveBeenCalledWith('3452', {
                status: 'failed',
                endTime: baseTime.valueOf(),
            });
        });

        it('should call sendLog with message if we get error from parameter', function() {
            reporter.hookIds = new Map([['beforeAll', '3452']]);
            spyOn(reporter, 'sendLog');
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.hookDone('beforeAll', 'failed', 'error');

            expect(reporter.sendLog).toHaveBeenCalledWith('3452', {
                message: 'message: error',
                level: 'ERROR',
            });
        });

        it('should not call finishTestItem if there is no appropriate hook', function() {
            reporter.hookIds = new Map([['beforeAll', '3452']]);
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.hookDone('beforeEach');

            expect(reporter.client.finishTestItem).not.toHaveBeenCalled();
        });
    });

    describe('specDone', function() {
        it('should call finishParent, additionalCustomParams should be empty object', function() {
            spyOn(reporter, 'finishParent');
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.specDone({
                fullName: 'full Name',
                status: 'pending'
            });

            expect(reporter.finishParent).toHaveBeenCalled();
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('should call method sendLog with the appropriate parameter', function() {
            const promise = Promise.resolve(null);
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.specDone({
                fullName: 'full Name',
                status: 'pending'
            });

            promise.then(function () {
                expect(reporter.client.sendLog).toHaveBeenCalledWith(null, {
                    message: 'full Name',
                    level: '',
                    time: baseTime.valueOf()
                }, null);
            });
        });

        it('should call method finishTestItem with the appropriate parameter, status is pending', function() {
            promise = Promise.resolve(null);
            reporter.additionalCustomParams = {
                attributes: [{ key: 'key', value: 'value' }],
                description: 'text description',
                testCaseId: 'testCaseId',
            };
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.specDone({
                fullName: 'full Name',
                status: 'pending'
            });

            promise.then(function () {
                expect(reporter.client.finishTestItem).toHaveBeenCalledWith(null, {
                    status: 'skipped',
                    attributes: [{ key: 'key', value: 'value' }],
                    description: 'text description',
                    testCaseId: 'testCaseId'
                });
            });
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('should call method finishTestItem with the appropriate parameter, status is disabled', function() {
            promise = Promise.resolve(null);
            reporter.additionalCustomParams = { attributes: [{ key: 'key', value: 'value' }] };
            reporter.conf.skippedIssue = false;
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.specDone({
                fullName: 'full Name',
                status: 'disabled'
            });

            promise.then(function () {
                expect(reporter.client.finishTestItem).toHaveBeenCalledWith( null, {
                    status: 'skipped',
                    attributes: [{ key: 'key', value: 'value' }],
                    issue: {
                        issueType: 'NOT_ISSUE'
                    },
                });

                reporter.conf.skippedIssue = true;
            });
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('should call methods finishTestItem and sendLog with the appropriate parameter, status should be failed, message should not be empty', function() {
            promise = Promise.resolve(null);
            reporter.additionalCustomParams = { attributes: [{ key: 'key', value: 'value' }] };
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.specDone({
                fullName: 'full Name',
                status: 'failed',
                failedExpectations: [{ message: 'error', stack: 'stack' }]
            });

            promise.then(function () {
                expect(reporter.client.sendLog).toHaveBeenCalledWith(null, {
                    message: `message: error
stackTrace: stack`,
                    level: 'ERROR',
                    time: baseTime.valueOf()
                }, null);
                expect(reporter.client.finishTestItem).toHaveBeenCalledWith(null, { status: 'failed', attributes: [{ key: 'key', value: 'value' }] });
            });
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('should call SpecificUtils.takeScreenshot if attachPicturesToLogs is true', function() {
            reporter.conf.attachPicturesToLogs = true;
            spyOn(SpecificUtils, 'takeScreenshot').and.returnValue(Promise.resolve(null));
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            reporter.specDone({
                fullName: 'full Name',
                status: 'disabled'
            });

            expect(SpecificUtils.takeScreenshot).toHaveBeenCalledWith('full Name');
        });
    });

    describe('suiteDone', function() {
        it('should send a request to the agent', function() {
            const tempId = 'ferw3452';
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId,
				promise: Promise.resolve()
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
				promise: Promise.resolve()
            });

            reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });
            reporter.suiteDone();

            expect(reporter.client.finishTestItem).toHaveBeenCalledWith(tempId, {});
        });

        describe('installHooks', function () {
            it('should call SpecificUtils.makeHooksWrapper', function() {
                spyOn(SpecificUtils, 'makeHooksWrapper');

                reporter.installHooks();

                expect(SpecificUtils.makeHooksWrapper).toHaveBeenCalledTimes(4);
            });
        });
    });
});
