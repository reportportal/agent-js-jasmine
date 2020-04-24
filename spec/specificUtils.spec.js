const SpecificUtils = require('../lib/specificUtils');

describe('Specific Utils', function() {
    describe('takeScreenshot', function () {
        it('should return promise if browser is false, promise resolve should be null', function() {
            browser = false;

            const promise = SpecificUtils.takeScreenshot('fileName');

            expect(promise.then).toBeDefined();
            promise.then(function (value) {
                expect(value).toEqual(null);
            });
        });

        it('should call browser.takeScreenshot if browser is true', function() {
            browser = jasmine.createSpyObj('browser', {
                'takeScreenshot': new Promise(function() {})
            });

            SpecificUtils.takeScreenshot('fileName');

            expect(browser.takeScreenshot).toHaveBeenCalled();
        });

        it('if browser is true and browser.takeScreenshot is successful, promise resolve should be object', function() {
            const expectedPromiseResolvedObj = {
                name: 'fileName',
                type: 'image/png',
                content: 'png'
            };
            browser = jasmine.createSpyObj('browser', {
                'takeScreenshot': Promise.resolve('png')
            });

            const promise = SpecificUtils.takeScreenshot('fileName');

            expect(browser.takeScreenshot).toHaveBeenCalled();
            promise.then(function (value) {
                expect(value).toEqual(expectedPromiseResolvedObj);
            });
        });

        it('if browser is true and browser.takeScreenshot is unsuccessful, promise resolve should be null', function() {
            browser = jasmine.createSpyObj('browser', {
                'takeScreenshot': Promise.reject()
            });

            const promise = SpecificUtils.takeScreenshot('fileName');

            expect(browser.takeScreenshot).toHaveBeenCalled();
            promise.then(function (value) {
                expect(value).toEqual(null);
            });
        });
    });

    describe('getLaunchObj', function () {
        it('should return launchObj only with system attribute and description if parameter doesn\'t set', function() {
            const expectedLaunchObj = {
                attributes: [{
                    key: 'agent',
                    value: 'agentName|agentVersion',
                    system: true,
                }],
                description: undefined
            };
            spyOn(SpecificUtils, 'getSystemAttributes').and.returnValue([
                {
                    key: 'agent',
                    value: 'agentName|agentVersion',
                    system: true,
                }
            ]);

            const launchObj = SpecificUtils.getLaunchObj({});

            expect(launchObj).toEqual(expectedLaunchObj);
        });

        it('should return correct launchObj with attribute, description if parameter has description and custom attributes', function() {
            const expectedLaunchObj = {
                attributes: [{
                    key: 'key',
                    value: 'value',
                }, {
                    key: 'agent',
                    value: 'agentName|agentVersion',
                    system: true,
                }],
                description: 'description'
            };
            spyOn(SpecificUtils, 'getSystemAttributes').and.returnValue([
                {
                    key: 'agent',
                    value: 'agentName|agentVersion',
                    system: true,
                }
            ]);

            const launchObj = SpecificUtils.getLaunchObj({
                attributes: [{
                    key: 'key',
                    value: 'value',
                }],
                description: 'description'
            });

            expect(launchObj).toEqual(expectedLaunchObj);
        });

        it('should return correct launchObj with attribute, description, id, rerun, rerunOf if parameter has description, attributes, id, rerun, rerunOf', function() {
            const expectedLaunchObj = {
                attributes: [{
                    key: 'key',
                    value: 'value',
                }, {
                    key: 'agent',
                    value: 'agentName|agentVersion',
                    system: true,
                }],
                description: 'description',
                id: 'id',
                rerun: true,
                rerunOf: '00000000-0000-0000-0000-000000000000',
            };
            spyOn(SpecificUtils, 'getSystemAttributes').and.returnValue([
                {
                    key: 'agent',
                    value: 'agentName|agentVersion',
                    system: true,
                }
            ]);

            const launchObj = SpecificUtils.getLaunchObj({
                attributes: [{
                    key: 'key',
                    value: 'value',
                }],
                description: 'description',
                id: 'id',
                rerun: true,
                rerunOf: '00000000-0000-0000-0000-000000000000',
            });

            expect(launchObj).toEqual(expectedLaunchObj);
        });

        describe('getAgentInfo', function () {
            it('should contain version and name properties', function() {
                const agentParams = SpecificUtils.getAgentInfo();

                expect(Object.keys(agentParams)).toContain('version');
                expect(Object.keys(agentParams)).toContain('name');
            });
        });

        describe('isPromise', function () {
            it('should return true if obj is promise', function() {
                const isPromise = SpecificUtils.isPromise(new Promise(() => {}));

                expect(isPromise).toEqual(true);
            });

            it('should return false if obj is not promise', function() {
                const isPromise = SpecificUtils.isPromise('string');

                expect(isPromise).toEqual(false);
            });
        });

        describe('isHookShouldBeCalled', function () {
            it('should return true if action is promise', function() {
                const isHookShouldBeCalled = SpecificUtils.isHookShouldBeCalled(new Promise(() => {}));

                expect(isHookShouldBeCalled).toEqual(true);
            });

            it('should return true if action is function', function() {
                const isHookShouldBeCalled = SpecificUtils.isHookShouldBeCalled(() => {});

                expect(isHookShouldBeCalled).toEqual(true);
            });
        });
    });
});
