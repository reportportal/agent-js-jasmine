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
const process = require('process');
const { RP_STATUSES } = require('@reportportal/client-javascript/lib/constants/statuses');
const pjson = require('./../package.json');

const PJSON_VERSION = pjson.version;
const PJSON_NAME = pjson.name;

const SpecificUtils = {
    takeScreenshot(fileName) {
        let promiseResolve;
        const promise = new Promise((resolve, reject) => {
            promiseResolve = resolve;
        });
        if (global.browser) {
            global.browser.takeScreenshot().then((png) => {
                promiseResolve({
                    name: fileName,
                    type: 'image/png',
                    content: png,
                });
            }, (error) => {
                console.dir(error);
                promiseResolve(null);
            });
        } else {
            promiseResolve(null);
        }
        return promise;
    },

    getLaunchObj(conf) {
        const systemAttr = this.getSystemAttributes(conf.skippedIssue);
        const launchObj = Object.assign(
            {
                attributes: conf.attributes ? [...conf.attributes, ...systemAttr] : systemAttr,
                description: conf.description,
            },
            conf.id && { id: conf.id },
            conf.rerun && { rerun: conf.rerun },
            conf.rerunOf && { rerunOf: conf.rerunOf },
        );

        return launchObj;
    },

    getSystemAttributes(skippedIssue) {
        const systemAttr = [{
            key: 'agent',
            value: `${PJSON_NAME}|${PJSON_VERSION}`,
            system: true,
        }];

        if (skippedIssue === false) {
            const skippedIssueAttribute = {
                key: 'skippedIssue',
                value: 'false',
                system: true,
            };

            systemAttr.push(skippedIssueAttribute);
        }

        return systemAttr;
    },

    getAgentInfo() {
        return {
            version: PJSON_VERSION,
            name: PJSON_NAME,
        };
    },

    getCodeRef(currentSpecIndex, fullTestName) {
        if (!global.browser) {
            return Promise.resolve(null);
        }

        return global.browser.getProcessedConfig().then((config) => {
            const currentTestFilePath = config.specs[currentSpecIndex].replace(new RegExp('\\\\', 'g'), '/');
            const processCwd = process.cwd().replace(/\\/g, '/');

            const testFileDir = path
                .parse(path.normalize(path.relative(processCwd, currentTestFilePath))).dir;

            const separator = testFileDir ? '/' : '';
            const testFile = path.parse(currentTestFilePath);

            return `${testFileDir}${separator}${testFile.base}/${fullTestName}`;
        });
    },

    getFullTestName(test) {
        if (test.description === test.fullName) {
            return test.description;
        }

        const parentName = test.fullName.replace(test.description, '').slice(0, -1);

        return `${parentName}/${test.description}`;
    },

    isPromise(obj) {
        return !!obj && (typeof obj === 'object' || typeof obj === 'function')
            && typeof obj.then === 'function';
    },

    isHookShouldBeCalled(action) {
        return !(this.isPromise(action) && action !== undefined && action.valueOf() === undefined);
    },

    makeHooksWrapper(wrapped, funcStart, funcFinish) {
        return function (action, timeout) {
            wrapped((done) => {
                let isFuncBeCalled = true;

                try {
                    isFuncBeCalled = SpecificUtils.isHookShouldBeCalled(action(done));

                    if (isFuncBeCalled) {
                        funcStart();
                        funcFinish();
                    }

                    done();
                } catch (err) {
                    if (isFuncBeCalled) {
                        funcStart();
                        funcFinish(RP_STATUSES.FAILED, err);
                    }

                    done.fail(err);
                }
            }, timeout);
        };
    },
};

module.exports = SpecificUtils;
