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

const ReportportalAgent = require('../lib/reportportal-agent');
const JasmineReportportalReporter = require('../lib/jasmine-reportportal-reporter');
const SpecificUtils = require('../lib/specificUtils');

const reporterOptions = {
    token: '00000000-0000-0000-0000-000000000000',
    endpoint: 'endpoint',
    project: 'projectName',
    launch: 'launcherName',
    description: 'description',
    attributes: [
        {
            key: 'YourKey',
            value: 'YourValue',
        },
        {
            value: 'YourValue',
        },
    ],
};
const options = Object.assign(reporterOptions, {
    id: 'id',
    rerun: true,
    rerunOf: 'rerunOf',
});

describe('Report Portal agent', () => {
    let agent;

    beforeAll(() => {
        agent = new ReportportalAgent(options);
    });

    afterEach(() => {
        agent.launchStatus = undefined;
        agent.tempLaunchId = null;
    });

    it('should be properly initialized', () => {
        expect(agent.tempLaunchId).toBeDefined();
        expect(agent.client).toBeDefined();
    });

    it('should call SpecificUtils.getLaunchObj and SpecificUtils.getAgentParams', () => {
        spyOn(SpecificUtils, 'getLaunchObj').and.returnValue({
            attributes: [],
        });
        spyOn(SpecificUtils, 'getAgentInfo').and.returnValue({
            version: 'version',
            name: 'name',
        });

        agent = new ReportportalAgent(options);

        expect(SpecificUtils.getLaunchObj).toHaveBeenCalled();
        expect(SpecificUtils.getAgentInfo).toHaveBeenCalled();
    });

    it('setLaunchStatus should set the status for launchStatus variable', () => {
        agent.setLaunchStatus('passed');

        expect(agent.launchStatus).toEqual('passed');
    });

    it('getJasmineReporter should return instance of JasmineReportportalReporter', () => {
        const instanceJasmineReportportalReporter = agent.getJasmineReporter();

        expect(instanceJasmineReportportalReporter).toEqual(jasmine.any(JasmineReportportalReporter));
        expect(instanceJasmineReportportalReporter).toBeDefined();
        expect(instanceJasmineReportportalReporter.client).toBeDefined();
        expect(instanceJasmineReportportalReporter.parentsInfo).toEqual([]);
    });

    it('getLaunchStartPromise should return promise', () => {
        spyOn(agent.launchInstance, 'promise').and.returnValue(Promise.resolve('ok'));

        const launchStartPromise = agent.getLaunchStartPromise();

        expect(launchStartPromise().then).toBeDefined();
    });

    it('getExitPromise should call client.finishLaunch without status', () => {
        agent.tempLaunchId = 'tempLaunchId';
        spyOn(agent.client, 'finishLaunch').and.returnValue({
            promise: Promise.resolve(),
        });

        agent.getExitPromise();

        expect(agent.client.finishLaunch).toHaveBeenCalledWith('tempLaunchId', {});
    });

    it('getExitPromise should call client.finishLaunch with status passed', () => {
        agent.tempLaunchId = 'tempLaunchId';
        agent.launchStatus = 'passed';
        spyOn(agent.client, 'finishLaunch').and.returnValue({
            promise: Promise.resolve(),
        });

        agent.getExitPromise();

        expect(agent.client.finishLaunch).toHaveBeenCalledWith('tempLaunchId', { status: 'passed' });
    });

    it('getPromiseFinishAllItems should return client.getPromiseFinishAllItems', () => {
        spyOn(agent.client, 'getPromiseFinishAllItems').and.returnValue({
            promise: Promise.resolve('ok'),
        });

        agent.getPromiseFinishAllItems('launchTempId');

        expect(agent.client.getPromiseFinishAllItems).toHaveBeenCalledWith('launchTempId');
    });
});
