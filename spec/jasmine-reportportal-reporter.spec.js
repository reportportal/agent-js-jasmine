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

describe('jasmine Report Portal reporter', function() {
    const Reporter = require('../lib/jasmine-reportportal-reporter');
    const SpecificUtils = require('../lib/specificUtils');

    let reporter;
    let tempLaunchId = 'ewrf35432r';
    let promise;
    let baseTime;

    beforeEach(function() {
        const client = {
            startTestItem() {},
            finishTestItem() {},
            sendLog() {},
        };
        const onSetLaunchStatus = function() {};
        baseTime = new Date(2020, 4, 8);

        jasmine.clock().mockDate(baseTime);
        reporter = new Reporter({
            client: client,
            tempLaunchId: tempLaunchId,
        }, onSetLaunchStatus);
    });

    afterEach(function() {
        promise = null;
        reporter.parentInfo = [];
        reporter.hookIds = null;
        reporter.additionalCustomParams = {};
        reporter.conf.attachPicturesToLogs = false;
        reporter.conf.reportHooks = false;
    });

    it('should be properly initialized', function() {
        expect(reporter.parentInfo.length).toBe(0);
    });

    it('should escape markdown', function() {
        const escapeString = reporter.escapeMarkdown('_test*');

        expect(escapeString).toBe('\\_test\\*');
    });

    describe('reportHooks', function() {
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

    describe('getParentInfo', function() {
        it('should return null if getParentInfo is empty', function() {
            reporter.parentInfo = [];

            const parent = reporter.getParentInfo();

            expect(parent).toEqual(null);
        });

        it('should return last parent if there is no number as parameter', function() {
            reporter.parentInfo = [1, 2, 3];

            const parent = reporter.getParentInfo();

            expect(parent).toEqual(3);
        });
    });

    describe('getParentOfParentInfo', function() {
        it('should return null if this.parentInfo is empty', function() {
            reporter.parentInfo = [];

            const parent = reporter.getParentOfParentInfo();

            expect(parent).toEqual(null);
        });

        it('should return null if this.parentInfo.length less then 2', function() {
            reporter.parentInfo = [1];

            const parent = reporter.getParentOfParentInfo();

            expect(parent).toEqual(null);
        });

        it('should return correct parent if this.parentInfo.length more then 1', function() {
            reporter.parentInfo = [1, 2];

            const parent = reporter.getParentOfParentInfo();

            expect(parent).toEqual(1);
        });
    });

    describe('changeCurrentTestFilePath', function() {
        it('should assign zero to currentTestFilePathIndex if currentTestFilePathIndex is undefined', function() {
            reporter.currentTestFilePathIndex = undefined;

            reporter.changeCurrentTestFilePath();

            expect(reporter.currentTestFilePathIndex).toEqual(0);
        });

        it('should increase by one the currentTestFilePathIndex if currentTestFilePathIndex is not undefined and suite.description is equal to suite.fullName', function() {
            reporter.currentTestFilePathIndex = 0;

            reporter.changeCurrentTestFilePath({ description: 'text', fullName: 'text' });

            expect(reporter.currentTestFilePathIndex).toEqual(1);
        });

        it('should not change the currentTestFilePathIndex value if currentTestFilePathIndex is not undefined and suite.description is not equal to suite.fullName', function() {
            reporter.currentTestFilePathIndex = 0;

            reporter.changeCurrentTestFilePath({ description: 'text', fullName: 'text1' });

            expect(reporter.currentTestFilePathIndex).toEqual(0);
        });
    });

    describe('addAttributes', function() {
        it('additionalCustomParams should not be empty if addAttributes\' parameter is not empty', function() {
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

        it('additionalCustomParams should be correct if we call addAttributes with attributes few times', function() {
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

        it('additionalCustomParams should be empty if addAttributes\' parameter and additionalCustomParams are empty', function() {
            const expectedAdditionalCustomParams = {};
            reporter.additionalCustomParams = {};

            reporter.addAttributes();

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('suiteAttributes should not be empty if addAttributes\' parameter has suite property', function() {
            const attributes = [{
                key: 'key',
                value: 'value',
            }];
            const expectedSuiteAttributes = new Map([['suite', attributes]]);

            reporter.addAttributes({ attributes, suite: 'suite' });

            expect(reporter.suiteAttributes).toEqual(expectedSuiteAttributes);
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('suiteAttributes should be correct if addAttributes\' parameter has suite property and we call addAttributes few times', function() {
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

    describe('setDescription', function() {
        it('additionalCustomParams should not be empty if setDescription\' parameter is not empty', function() {
            const expectedAdditionalCustomParams = {
                customParams: 'value',
                description: 'text description'
            };
            reporter.additionalCustomParams = { customParams: 'value' };

            reporter.setDescription({ text: 'text description' });

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('suiteDescription should not be empty if setDescription\' parameter has suite property', function() {
            const expectedSuiteDescription = new Map([['suite', 'text description']]);

            reporter.setDescription({ text: 'text description', suite: 'suite' });

            expect(reporter.suiteDescription).toEqual(expectedSuiteDescription);
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('additionalCustomParams should be empty if setDescription\' parameter and additionalCustomParams are empty', function() {
            const expectedAdditionalCustomParams = {};
            reporter.additionalCustomParams = {};

            reporter.setDescription();

            expect(reporter.additionalCustomParams).toEqual(expectedAdditionalCustomParams);
        });
    });

    describe('setTestCaseId', function() {
        it('additionalCustomParams should not be empty if setTestCaseId\' parameter is not empty', function() {
            const expectedAdditionalCustomParams = {
                customParams: 'value',
                testCaseId: 'testCaseId'
            };
            reporter.additionalCustomParams = { customParams: 'value' };

            reporter.setTestCaseId({ testCaseId: 'testCaseId' });

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('suiteTestCaseIds should not be empty if setTestCaseId\' parameter has suite property', function() {
            const expectedSuiteTestCaseIds = new Map([['suite', 'testCaseId']]);

            reporter.setTestCaseId({ testCaseId: 'testCaseId', suite: 'suite' });

            expect(reporter.suiteTestCaseIds).toEqual(expectedSuiteTestCaseIds);
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('additionalCustomParams should be empty if setTestCaseId\' parameter and additionalCustomParams are empty', function() {
            const expectedAdditionalCustomParams = {};
            reporter.additionalCustomParams = {};

            reporter.setTestCaseId();

            expect(reporter.additionalCustomParams).toEqual(expectedAdditionalCustomParams);
        });
    });

    describe('setStatus', function() {
        it('additionalCustomParams should not be empty if setStatus\' parameter is not empty', function() {
            const expectedAdditionalCustomParams = {
                customParams: 'value',
                customStatus: 'passed'
            };
            reporter.additionalCustomParams = { customParams: 'value' };

            reporter.setStatus({ status: 'passed' });

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('suiteStatuses should not be empty if setStatus\' parameter has suite property', function() {
            const expectedSuiteStatus = new Map([['suite', 'passed']]);

            reporter.setStatus({ status: 'passed', suite: 'suite' });

            expect(reporter.suiteStatuses).toEqual(expectedSuiteStatus);
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('additionalCustomParams should be empty if setStatus\' parameter and additionalCustomParams are empty', function() {
            const expectedAdditionalCustomParams = {};
            reporter.additionalCustomParams = {};

            reporter.setStatus();

            expect(reporter.additionalCustomParams).toEqual(expectedAdditionalCustomParams);
        });
    });

    describe('addTestItemLog', function() {
        it('additionalCustomParams should not be empty if addTestItemLog\' parameter is not empty', function() {
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

        it('additionalCustomParams should be correct if we call addTestItemLog with logs few times', function() {
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

        it('suiteLogs should not be empty if addTestItemLog\' parameter has suite property', function() {
            const logs = { level: 'level', file: null, message: 'message' };
            const expectedSuiteLogs = new Map([['suite', [logs]]]);

            reporter.addTestItemLog({ log: logs, suite: 'suite' });

            expect(reporter.suiteLogs).toEqual(expectedSuiteLogs);
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('suiteLogs should be correct if addTestItemLog\' parameter has suite property and we call addTestItemLog few times', function() {
            const logsOne = { level: 'levelOne', file: null, message: 'message one' };
            const logsTwo = { level: 'levelTwo', file: null, message: 'message two' };
            const expectedSuiteLogs = new Map([['suite', [logsOne].concat([logsTwo])]]);

            reporter.addTestItemLog({ log: logsOne, suite: 'suite' });
            reporter.addTestItemLog({ log: logsTwo, suite: 'suite' });

            expect(reporter.suiteLogs).toEqual(expectedSuiteLogs);
            expect(reporter.additionalCustomParams).toEqual({});
        });
    });

    describe('sendLaunchLog', function() {
        it('should call sendLog with tempLaunchId and log', function() {
            const log = { level: 'level', file: null, message: 'message' };
            spyOn(reporter, 'sendLog');

            reporter.sendLaunchLog(log);

            expect(reporter.sendLog).toHaveBeenCalledWith(tempLaunchId, log);
        });
    });

    describe('sendLog', function() {
        it('should call client.sendLog with correct parameters', function() {
            const log = { level: 'level', file: null, message: 'message' };
            spyOn(reporter.client, 'sendLog');

            reporter.sendLog(tempLaunchId, log);

            expect(reporter.client.sendLog).toHaveBeenCalledWith(tempLaunchId, {
                message: 'message',
                level: 'level',
                time: baseTime.valueOf()
            }, null);
        });

        it('should call client.sendLog with default parameters if sendLog doesn\'t have all parameter', function() {
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

    describe('getSuiteAttributesBySuite', function() {
        it('should return correct array of suiteAttributes', function() {
            const attributes = [{
                key: 'key',
                value: 'value',
            }];
            reporter.suiteAttributes = new Map([['suite', attributes]]);

            const suiteAttributes = reporter.getSuiteAttributesBySuite('suite');

            expect(suiteAttributes).toEqual([{ key: 'key', value: 'value' }]);
        });

        it('should return undefined if there is no suitable suite', function() {
            const attributes = [{
                key: 'key',
                value: 'value',
            }];
            reporter.suiteAttributes = new Map([['suite', attributes]]);

            const suiteAttributes = reporter.getSuiteAttributesBySuite('suite1');

            expect(suiteAttributes).toEqual(undefined);
        });
    });

    describe('getSuiteStatusBySuite', function() {
        it('should return correct status of suiteStatuses', function() {
            reporter.suiteStatuses = new Map([['suite', 'passed']]);

            const suiteStatuses = reporter.getSuiteStatusBySuite('suite');

            expect(suiteStatuses).toEqual('passed');
        });

        it('should return undefined if there is no suitable suite', function() {
            reporter.suiteStatuses = new Map([['suite', 'passed']]);

            const suiteStatuses = reporter.getSuiteStatusBySuite('suite1');

            expect(suiteStatuses).toEqual(undefined);
        });
    });

    describe('getSuiteDescriptionBySuite', function() {
        it('should return correct array of suiteDescription', function() {
            reporter.suiteDescription = new Map([['suite', 'text']]);

            const suiteDescription = reporter.getSuiteDescriptionBySuite('suite');

            expect(suiteDescription).toEqual('text');
        });

        it('should return undefined if there is no suitable suite', function() {
            reporter.suiteDescription = new Map([['suite', 'text']]);

            const suiteDescription = reporter.getSuiteDescriptionBySuite('suite1');

            expect(suiteDescription).toEqual(undefined);
        });
    });

    describe('getTopLevelType', function() {
        it('should return level type \'test\' if parentInfo is not empty', function() {
            reporter.parentInfo = [0, 1];

            const levelType = reporter.getTopLevelType();

            expect(levelType).toBe('test');
        });

        it('should return level type \'suite\' if parentInfo is empty', function() {
            reporter.parentInfo = [];

            const levelType = reporter.getTopLevelType();

            expect(levelType).toBe('suite');
        });
    });

    describe('suiteStarted', function() {
        beforeEach(function() {
            spyOn(SpecificUtils, 'getCodeRef').and.returnValue(Promise.resolve('codeRef'));
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452',
                promise: Promise.resolve()
            });
        });

        it('should send a request to the agent', function(done) {
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
            spyOn(reporter, 'sendLog');

            const promise = reporter.suiteStarted({
                description: 'suite',
                fullName: 'test name'
            });

            promise.then(function() {
                expect(reporter.client.startTestItem).toHaveBeenCalledWith({
                    type: 'suite',
                    name: 'suite',
                    attributes: [{ key: 'key', value: 'value' }],
                    description: 'text description',
                    testCaseId: 'testCaseId',
                    codeRef: 'codeRef',
                    startTime: baseTime.valueOf()
                }, tempLaunchId, null);
                expect(reporter.sendLog).toHaveBeenCalledTimes(2);
                expect(reporter.sendLog).toHaveBeenCalledWith('3452', logs[0]);
                expect(reporter.sendLog).toHaveBeenCalledWith('3452', logs[1]);

                done();
            });
        });

        it('should create an element in parentInfo', function(done) {
            const promise = reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });

            promise.then(function() {
                expect(reporter.parentInfo.length).toBe(1);

                done();
            });
        });
    });

    describe('specStarted', function() {
        beforeEach(function() {
            spyOn(SpecificUtils, 'getCodeRef').and.returnValue(Promise.resolve('codeRef'));
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452',
                promise: Promise.resolve()
            });
        });

        it('should send a request to the agent', function(done) {
            const promise = reporter.specStarted({
                description: 'test description',
                fullName: 'test name'
            });

            promise.then(function() {
                expect(reporter.client.startTestItem).toHaveBeenCalledWith({
                    type: 'step',
                    description: 'test description',
                    name: 'test description',
                    codeRef: 'codeRef',
                    startTime: baseTime.valueOf(),
                }, tempLaunchId, null);

                done();
            });
        });

        it('should call setParentInfo with the appropriate parameter', function(done) {
            spyOn(reporter, 'setParentInfo');

            const promise = reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name',
            });

            promise.then(function() {
                expect(reporter.setParentInfo).toHaveBeenCalledWith({ tempId: '3452', startTime: baseTime.valueOf() });

                done();
            });
        });
    });

    describe('getHookStartTime', function () {
        it('should return reporter.startTime minus one if hookType is BEFORE_SUITE', function() {
            reporter.startTime = 1234567891234;

            const startTime = reporter.getHookStartTime('BEFORE_SUITE', null);

            expect(startTime).toEqual(1234567891233);
        });

        it('should return reporter.startTime minus one if hookType is BEFORE_METHOD', function() {
            reporter.startTime = 1234567891234;

            const startTime = reporter.getHookStartTime('BEFORE_METHOD', { startTime: 1234567891233 });

            expect(startTime).toEqual(1234567891233);
        });

        it('should return reporter.startTime', function() {
            reporter.startTime = 1234567891234;

            const startTime = reporter.getHookStartTime('AFTER_SUITE', null);

            expect(startTime).toEqual(1234567891234);
        });

        it('should call getTime if reporter.startTime is null', function() {
            spyOn(reporter, 'getTime').and.returnValue(1234567891234);

            const startTime = reporter.getHookStartTime('AFTER_SUITE', null);

            expect(reporter.getTime).toHaveBeenCalled();
            expect(startTime).toEqual(1234567891234);
        });
    });

    describe('hookStarted', function() {
        it('should send a request to the agent, hookIds should be correct', function() {
            const expectedHookIds = new Map([['beforeAll', '3452']]);
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452',
                promise: Promise.resolve()
            });
            spyOn(reporter, 'getHookStartTime').and.returnValue(baseTime.valueOf());

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
        it('should call finishParent, additionalCustomParams should be empty object', function(done) {
            spyOn(reporter, 'finishParent');
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            const promise = reporter.specDone({
                fullName: 'full Name',
                status: 'pending'
            });

            promise.then(function() {
                expect(reporter.finishParent).toHaveBeenCalled();
                expect(reporter.additionalCustomParams).toEqual({});

                done();
            });
        });

        it('should call method sendLog with the appropriate parameter', function(done) {
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            const promise = reporter.specDone({
                fullName: 'full Name',
                status: 'pending'
            });

            promise.then(function() {
                expect(reporter.client.sendLog).toHaveBeenCalledWith(null, {
                    message: 'full Name',
                    level: '',
                    time: baseTime.valueOf()
                }, null);

                done();
            });
        });

        it('should call method finishTestItem with the appropriate parameter, status is pending', function(done) {
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

            const promise = reporter.specDone({
                fullName: 'full Name',
                status: 'pending'
            });

            promise.then(function() {
                expect(reporter.client.finishTestItem).toHaveBeenCalledWith(null, {
                    status: 'skipped',
                    attributes: [{ key: 'key', value: 'value' }],
                    description: 'text description',
                    testCaseId: 'testCaseId'
                });
                expect(reporter.additionalCustomParams).toEqual({});

                done();
            });
        });

        it('should call method finishTestItem with the appropriate parameter, status is disabled', function(done) {
            reporter.additionalCustomParams = { attributes: [{ key: 'key', value: 'value' }] };
            reporter.conf.skippedIssue = false;
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            const promise = reporter.specDone({
                fullName: 'full Name',
                status: 'disabled'
            });

            promise.then(function() {
                expect(reporter.client.finishTestItem).toHaveBeenCalledWith( null, {
                    status: 'skipped',
                    attributes: [{ key: 'key', value: 'value' }],
                    issue: {
                        issueType: 'NOT_ISSUE'
                    },
                });
                expect(reporter.additionalCustomParams).toEqual({});

                reporter.conf.skippedIssue = true;
                done();
            });
        });

        it('should call methods finishTestItem and sendLog with the appropriate parameter, status should be failed, message should not be empty', function(done) {
            reporter.additionalCustomParams = { attributes: [{ key: 'key', value: 'value' }] };
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            const promise = reporter.specDone({
                fullName: 'full Name',
                status: 'failed',
                failedExpectations: [{ message: 'error', stack: 'stack' }]
            });

            promise.then(function() {
                expect(reporter.client.sendLog).toHaveBeenCalledWith(null, {
                    message: `message: error
stackTrace: stack`,
                    level: 'ERROR',
                    time: baseTime.valueOf()
                }, null);
                expect(reporter.client.finishTestItem).toHaveBeenCalledWith(null, { status: 'failed', attributes: [{ key: 'key', value: 'value' }] });
                expect(reporter.additionalCustomParams).toEqual({});

                done();
            });
        });

        it('should call SpecificUtils.takeScreenshot if attachPicturesToLogs is true', function(done) {
            reporter.conf.attachPicturesToLogs = true;
            spyOn(SpecificUtils, 'takeScreenshot').and.returnValue(Promise.resolve(null));
            spyOn(reporter.client, 'sendLog').and.returnValue({
                tempId: 'sendLog',
                promise: Promise.resolve('ok')
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });

            const promise = reporter.specDone({
                fullName: 'full Name',
                status: 'disabled'
            });

            promise.then(function() {
                expect(SpecificUtils.takeScreenshot).toHaveBeenCalledWith('full Name');

                done();
            });
        });
    });

    describe('suiteDone', function() {
        beforeEach(function() {
            const tempId = 'ferw3452';
            spyOn(SpecificUtils, 'getCodeRef').and.returnValue(Promise.resolve(null));
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId,
                promise: Promise.resolve()
            });
            spyOn(reporter.client, 'finishTestItem').and.returnValue({
                promise: Promise.resolve()
            });
        });

        it('should send a request to the agent', function(done) {
            const promise = reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });

            promise.then(function() {
                reporter.suiteDone({ description: 'test description' });

                expect(reporter.client.finishTestItem).toHaveBeenCalledWith('ferw3452', {});

                done();
            });
        });

        it('should call client.finishTestItem with status passed', function(done) {
            reporter.suiteStatuses = new Map([['test description', 'passed']]);
            const promise = reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });

            promise.then(function() {
                reporter.suiteDone({ description: 'test description' });

                expect(reporter.client.finishTestItem).toHaveBeenCalledWith('ferw3452', { status: 'passed' });

                done();
            });
        });
    });

    describe('installHooks', function() {
        it('should call SpecificUtils.makeHooksWrapper', function() {
            spyOn(SpecificUtils, 'makeHooksWrapper');

            reporter.installHooks();

            expect(SpecificUtils.makeHooksWrapper).toHaveBeenCalledTimes(4);
        });
    });
});
