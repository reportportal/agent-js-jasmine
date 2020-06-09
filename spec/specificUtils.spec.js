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

const path = require('path');
const SpecificUtils = require('../lib/specificUtils');
const pjson = require('./../package.json');

describe('Specific Utils', () => {
    afterEach(() => {
        delete global.browser;
    });

    describe('takeScreenshot', () => {
        it('should return promise if browser is false, promise resolve should be null', (done) => {
            global.browser = undefined;

            const promise = SpecificUtils.takeScreenshot('fileName');

            expect(promise.then).toBeDefined();
            promise.then((value) => {
                expect(value).toEqual(null);

                done();
            });
        });

        it('should call browser.takeScreenshot if browser is true', () => {
            global.browser = jasmine.createSpyObj('global.browser', {
                takeScreenshot: new Promise((() => {})),
            });

            SpecificUtils.takeScreenshot('fileName');

            expect(global.browser.takeScreenshot).toHaveBeenCalled();
        });

        it('if browser is true and browser.takeScreenshot is successful, promise resolve should be object', (done) => {
            const expectedPromiseResolvedObj = {
                name: 'fileName',
                type: 'image/png',
                content: 'png',
            };
            global.browser = jasmine.createSpyObj('global.browser', {
                takeScreenshot: Promise.resolve('png'),
            });

            const promise = SpecificUtils.takeScreenshot('fileName');

            expect(global.browser.takeScreenshot).toHaveBeenCalled();
            promise.then((value) => {
                expect(value).toEqual(expectedPromiseResolvedObj);

                done();
            });
        });

        it('if browser is true and browser.takeScreenshot is unsuccessful, promise resolve should be null', (done) => {
            global.browser = jasmine.createSpyObj('global.browser', {
                takeScreenshot: Promise.reject(),
            });

            const promise = SpecificUtils.takeScreenshot('fileName');

            expect(global.browser.takeScreenshot).toHaveBeenCalled();
            promise.then((value) => {
                expect(value).toEqual(null);

                done();
            });
        });
    });

    describe('getLaunchObj', () => {
        it('should return launchObj only with system attribute and description if parameter doesn\'t set', () => {
            const expectedLaunchObj = {
                attributes: [{
                    key: 'agent',
                    value: 'agentName|agentVersion',
                    system: true,
                }],
                description: undefined,
            };
            spyOn(SpecificUtils, 'getSystemAttributes').and.returnValue([
                {
                    key: 'agent',
                    value: 'agentName|agentVersion',
                    system: true,
                },
            ]);

            const launchObj = SpecificUtils.getLaunchObj({});

            expect(launchObj).toEqual(expectedLaunchObj);
        });

        it('should return correct launchObj with attribute, description if parameter has description'
            + ' and custom attributes', () => {
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
            };
            spyOn(SpecificUtils, 'getSystemAttributes').and.returnValue([
                {
                    key: 'agent',
                    value: 'agentName|agentVersion',
                    system: true,
                },
            ]);

            const launchObj = SpecificUtils.getLaunchObj({
                attributes: [{
                    key: 'key',
                    value: 'value',
                }],
                description: 'description',
            });

            expect(launchObj).toEqual(expectedLaunchObj);
        });

        it('should return correct launchObj with attribute, description, id, rerun, rerunOf if parameter'
            + ' has description, attributes, id, rerun, rerunOf', () => {
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
                },
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

        describe('getSystemAttributes', () => {
            it('should return only agent system attribute if parameter is true', () => {
                const expectedSystemAttribute = [{
                    key: 'agent',
                    value: `${pjson.name}|${pjson.version}`,
                    system: true,
                }];

                const systemAttributes = SpecificUtils.getSystemAttributes(true);

                expect(systemAttributes).toEqual(expectedSystemAttribute);
            });

            it('should return only agent system attribute if there is no parameter', () => {
                const expectedSystemAttribute = [{
                    key: 'agent',
                    value: `${pjson.name}|${pjson.version}`,
                    system: true,
                }];

                const systemAttributes = SpecificUtils.getSystemAttributes();

                expect(systemAttributes).toEqual(expectedSystemAttribute);
            });

            it('should return agent and skippedIssue system attributes if parameter is false', () => {
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

                expect(systemAttributes).toEqual(expectedSystemAttribute);
            });
        });

        describe('getAgentInfo', () => {
            it('should contain version and name properties', () => {
                const agentParams = SpecificUtils.getAgentInfo();

                expect(Object.keys(agentParams)).toContain('version');
                expect(Object.keys(agentParams)).toContain('name');
            });
        });

        describe('getCodeRef', () => {
            it('should return promise if browser is false, promise resolve should be null', (done) => {
                global.browser = undefined;

                const promise = SpecificUtils.getCodeRef();

                promise.then((value) => {
                    expect(value).toEqual(null);

                    done();
                });
            });

            it('should return promise, promise resolve should be codeRef value if browser is true', (done) => {
                global.browser = jasmine.createSpyObj('global.browser', {
                    getProcessedConfig: new Promise(((resolve) => {
                        resolve({ specs: ['C:\\Path\\test.spec.js'] });
                    })),
                });
                spyOn(process, 'cwd').and.returnValue('C:\\Path');

                const promise = SpecificUtils.getCodeRef(0, 'testName');

                expect(global.browser.getProcessedConfig).toHaveBeenCalled();
                promise.then((codeRef) => {
                    expect(codeRef).toEqual('test.spec.js/testName');

                    done();
                });
            });

            it('should return promise, replace separator with \'/\', promise resolve should be codeRef value if'
                + ' browser is true', (done) => {
                global.browser = jasmine.createSpyObj('global.browser', {
                    getProcessedConfig: new Promise(((resolve) => {
                        resolve({ specs: ['C:\\Path\\example\\test.spec.js'] });
                    })),
                });
                spyOn(process, 'cwd').and.returnValue('C:\\Path');

                const promise = SpecificUtils.getCodeRef(0, 'testName');

                expect(global.browser.getProcessedConfig).toHaveBeenCalled();
                promise.then((codeRef) => {
                    expect(codeRef).toEqual('example/test.spec.js/testName');

                    done();
                });
            });
        });

        describe('getFullTestName', () => {
            it('should return test.description if test.description is equal to test.fullName', () => {
                const fullTestName = SpecificUtils.getFullTestName({ description: 'test', fullName: 'test' });

                expect(fullTestName).toEqual('test');
            });

            it('should return correct fullTestName if test.description is not equal to test.fullName', () => {
                const fullTestName = SpecificUtils.getFullTestName({ description: 'spec', fullName: 'suite spec' });

                expect(fullTestName).toEqual('suite/spec');
            });
        });

        describe('isPromise', () => {
            it('should return true if obj is promise', () => {
                const isPromise = SpecificUtils.isPromise(new Promise(() => {}));

                expect(isPromise).toEqual(true);
            });

            it('should return false if obj is not promise', () => {
                const isPromise = SpecificUtils.isPromise('string');

                expect(isPromise).toEqual(false);
            });
        });

        describe('isHookShouldBeCalled', () => {
            it('should return true if action is promise', () => {
                const isHookShouldBeCalled = SpecificUtils.isHookShouldBeCalled(new Promise(() => {}));

                expect(isHookShouldBeCalled).toEqual(true);
            });

            it('should return true if action is function', () => {
                const isHookShouldBeCalled = SpecificUtils.isHookShouldBeCalled(() => {});

                expect(isHookShouldBeCalled).toEqual(true);
            });
        });
    });
});
