const path = require('path');
const SpecificUtils = require('../lib/specificUtils');
const pjson = require('./../package.json');

describe('Specific Utils', function() {
    describe('takeScreenshot', function() {
        it('should return promise if browser is false, promise resolve should be null', function(done) {
            global.browser = undefined;

            const promise = SpecificUtils.takeScreenshot('fileName');

            expect(promise.then).toBeDefined();
            promise.then(function(value) {
                expect(value).toEqual(null);

                done();
            });
        });

        it('should call browser.takeScreenshot if browser is true', function() {
            global.browser = jasmine.createSpyObj('global.browser', {
                'takeScreenshot': new Promise(function() {})
            });

            SpecificUtils.takeScreenshot('fileName');

            expect(global.browser.takeScreenshot).toHaveBeenCalled();
        });

        it('if browser is true and browser.takeScreenshot is successful, promise resolve should be object', function(done) {
            const expectedPromiseResolvedObj = {
                name: 'fileName',
                type: 'image/png',
                content: 'png'
            };
            global.browser = jasmine.createSpyObj('global.browser', {
                'takeScreenshot': Promise.resolve('png')
            });

            const promise = SpecificUtils.takeScreenshot('fileName');

            expect(global.browser.takeScreenshot).toHaveBeenCalled();
            promise.then(function(value) {
                expect(value).toEqual(expectedPromiseResolvedObj);

                done();
            });
        });

        it('if browser is true and browser.takeScreenshot is unsuccessful, promise resolve should be null', function(done) {
            global.browser = jasmine.createSpyObj('global.browser', {
                'takeScreenshot': Promise.reject()
            });

            const promise = SpecificUtils.takeScreenshot('fileName');

            expect(global.browser.takeScreenshot).toHaveBeenCalled();
            promise.then(function(value) {
                expect(value).toEqual(null);

                done();
            });
        });
    });

    describe('getLaunchObj', function() {
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

        describe('getSystemAttributes', function () {
            it('should return only agent system attribute if parameter is true', function() {
                const expectedSystemAttribute = [{
                    key: 'agent',
                    value: `${pjson.name}|${pjson.version}`,
                    system: true,
                }];

                const systemAttributes = SpecificUtils.getSystemAttributes(true);

                expect(systemAttributes).toEqual(expectedSystemAttribute)
            });

            it('should return only agent system attribute if there is no parameter', function() {
                const expectedSystemAttribute = [{
                    key: 'agent',
                    value: `${pjson.name}|${pjson.version}`,
                    system: true,
                }];

                const systemAttributes = SpecificUtils.getSystemAttributes();

                expect(systemAttributes).toEqual(expectedSystemAttribute)
            });

            it('should return agent and skippedIssue system attributes if parameter is false', function() {
                const expectedSystemAttribute = [{
                    key: 'agent',
                    value: `${pjson.name}|${pjson.version}`,
                    system: true,
                }, {
                    key: 'skippedIssue',
                    value: 'false',
                    system: true,
                }];

                const systemAttributes = SpecificUtils.getSystemAttributes(false);

                expect(systemAttributes).toEqual(expectedSystemAttribute)
            });
        });

        describe('getAgentInfo', function() {
            it('should contain version and name properties', function() {
                const agentParams = SpecificUtils.getAgentInfo();

                expect(Object.keys(agentParams)).toContain('version');
                expect(Object.keys(agentParams)).toContain('name');
            });
        });

        describe('getCodeRef', function() {
            it('should return promise if browser is false, promise resolve should be null', function(done) {
                global.browser = undefined;

                const promise = SpecificUtils.getCodeRef();

                promise.then(function(value) {
                    expect(value).toEqual(null);

                    done();
                });
            });

            it('should return promise, promise resolve should be codeRef value if browser is true', function(done) {
                global.browser = jasmine.createSpyObj('global.browser', {
                    'getProcessedConfig': new Promise(function(resolve) {
                        resolve({ specs: [`C:\\Path\\test.spec.js`] });
                    })
                });
                spyOn(process, 'cwd').and.returnValue('C:\\Path');

                const promise = SpecificUtils.getCodeRef(0, 'testName');

                expect(global.browser.getProcessedConfig).toHaveBeenCalled();
                promise.then(function(codeRef) {
                    expect(codeRef).toEqual('test.spec.js/testName');

                    done();
                });
            });

            it('should return promise, replace separator with \'/\', promise resolve should be codeRef value if browser is true', function(done) {
                global.browser = jasmine.createSpyObj('global.browser', {
                    'getProcessedConfig': new Promise(function(resolve) {
                        resolve({ specs: [`C:\\Path\\example\\test.spec.js`] });
                    })
                });
                spyOn(process, 'cwd').and.returnValue('C:\\Path');

                const promise = SpecificUtils.getCodeRef(0, 'testName');

                expect(global.browser.getProcessedConfig).toHaveBeenCalled();
                promise.then(function(codeRef) {
                    expect(codeRef).toEqual('example/test.spec.js/testName');

                    done();
                });
            });
        });

        describe('getFullTestName', function() {
            it('should return test.description if test.description is equal to test.fullName', function() {
                const fullTestName = SpecificUtils.getFullTestName({ description: 'test', fullName: 'test' });

                expect(fullTestName).toEqual('test');
            });

            it('should return correct fullTestName if test.description is not equal to test.fullName', function() {
                const fullTestName = SpecificUtils.getFullTestName({ description: 'spec', fullName: 'suite spec' });

                expect(fullTestName).toEqual('suite/spec');
            });
        });

        describe('isPromise', function() {
            it('should return true if obj is promise', function() {
                const isPromise = SpecificUtils.isPromise(new Promise(() => {}));

                expect(isPromise).toEqual(true);
            });

            it('should return false if obj is not promise', function() {
                const isPromise = SpecificUtils.isPromise('string');

                expect(isPromise).toEqual(false);
            });
        });

        describe('isHookShouldBeCalled', function() {
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
