describe('jasmine Report Portal reporter', function() {
    const Reporter = require('../lib/jasmine-reportportal-reporter');
    const SpecificUtils = require('../lib/specificUtils');

    let reporter;
    let tempLaunchId = 'ewrf35432r';
    let promise;

    beforeEach(function() {
        let client = {
            startTestItem() {},
            finishTestItem() {},
            sendLog() {},
        };

        reporter = new Reporter({
            client: client,
            tempLaunchId: tempLaunchId,
        });
    });

    afterEach(function () {
        promise = null;
        reporter.parentIds = [];
        reporter.additionalCustomParams = {};
        reporter.conf.attachPicturesToLogs = false;
    });

    it('should be properly initialized', function() {
        expect(reporter.parentIds.length).toBe(0);
    });

    it('should escape markdown', function() {
        const escapeString = reporter.escapeMarkdown('_test*');

        expect(escapeString).toBe('\\_test\\*');
    });

    describe('setAttributes', function () {
        it('additionalCustomParams should not be empty if setAttributes\' parameter is not empty', function () {
            const expectedAdditionalCustomParams = {
                customParams: 'value',
                key: 'value'
            };
            reporter.additionalCustomParams = { customParams: 'value' };

            reporter.setAttributes({ key: 'value' });

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });

        it('additionalCustomParams should be empty if setAttributes\' parameter and additionalCustomParams are empty', function () {
            const expectedAdditionalCustomParams = {};
            reporter.additionalCustomParams = {};

            reporter.setAttributes();

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
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

        it('additionalCustomParams should be empty if setDescription\' parameter and additionalCustomParams are empty', function () {
            const expectedAdditionalCustomParams = {};
            reporter.additionalCustomParams = {};

            reporter.setDescription();

            expect(reporter.additionalCustomParams ).toEqual(expectedAdditionalCustomParams);
        });
    });

    describe('getTopLevelType', function () {
        it('should return level type \'test\' if parentIds is not empty', function () {
            reporter.parentIds = [0, 1];

            const levelType = reporter.getTopLevelType();

            expect(levelType).toBe('TEST');
        });

        it('should return level type \'suite\' if parentIds is empty', function () {
            reporter.parentIds = [];

            const levelType = reporter.getTopLevelType();

            expect(levelType).toBe('SUITE');
        });
    });

    describe('suiteStarted', function() {
        it('should send a request to the agent', function() {
            reporter.additionalCustomParams = { attributes: { key: 'value' }, description: 'text description' };
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452',
				promise: Promise.resolve()
            });

            reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });

            expect(reporter.client.startTestItem).toHaveBeenCalledWith({
                type: 'SUITE',
                name: 'test name',
                attributes: { key: 'value' },
                description: 'text description'
            }, tempLaunchId, null);
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
                type: 'STEP',
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
                    level: ''
                }, null);
            });
        });

        it('should call method finishTestItem with the appropriate parameter, status is pending', function() {
            promise = Promise.resolve(null);
            reporter.additionalCustomParams = { attributes: { key: 'value' }, description: 'text description' };
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
                    attributes: { key: 'value' },
                    description: 'text description'
                });
            });
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('should call method finishTestItem with the appropriate parameter, status is disabled', function() {
            promise = Promise.resolve(null);
            reporter.additionalCustomParams = { attributes: { key: 'value' } };
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
                expect(reporter.client.finishTestItem).toHaveBeenCalledWith( null, { status: 'skipped', attributes: { key: 'value' } });
            });
            expect(reporter.additionalCustomParams).toEqual({});
        });

        it('should call methods finishTestItem and sendLog with the appropriate parameter, status should be failed, message should not be empty', function() {
            promise = Promise.resolve(null);
            reporter.additionalCustomParams = { attributes: { key: 'value' } };
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
                    level: 'ERROR'
                }, null);
                expect(reporter.client.finishTestItem).toHaveBeenCalledWith(null, { status: 'failed', attributes: { key: 'value' } });
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
    });
});
