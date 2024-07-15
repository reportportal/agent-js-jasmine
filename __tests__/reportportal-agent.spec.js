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
  apiKey: 'reportportalApiKey',
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
    jest.clearAllMocks(); // Clear mocks before initialization
    agent = new ReportportalAgent(options);
  });

  it('should be properly initialized', () => {
    expect(agent.tempLaunchId).toBeDefined();
    expect(agent.client).toBeDefined();
  });

  it('should call SpecificUtils.getLaunchObj and SpecificUtils.getAgentParams', () => {
    jest.spyOn(SpecificUtils, 'getLaunchObj').mockReturnValue({ attributes: [] });
    jest.spyOn(SpecificUtils, 'getAgentInfo').mockReturnValue({ version: 'version', name: 'name' });

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

    expect(instanceJasmineReportportalReporter).toBeInstanceOf(JasmineReportportalReporter);
  });

  it('getLaunchStartPromise should return promise', () => {
    agent.launchInstance = { promise: jest.fn().mockReturnValue(Promise.resolve('ok')) };

    const launchStartPromise = agent.getLaunchStartPromise();

    expect(launchStartPromise().then).toBeDefined();
  });

  it('getExitPromise should return client.finishLaunch resolved value', async () => {
    jest.spyOn(agent.client, 'finishLaunch').mockReturnValue({ promise: Promise.resolve('ok') });

    const exitPromise = await agent.getExitPromise();

    expect(exitPromise).toEqual('ok');
  });

  it('getPromiseFinishAllItems should call client.getPromiseFinishAllItems', async () => {
    jest.spyOn(agent.client, 'getPromiseFinishAllItems').mockReturnValue(Promise.resolve('ok'));

    const finishPromise = await agent.getPromiseFinishAllItems('launchTempId');

    expect(agent.client.getPromiseFinishAllItems).toHaveBeenCalledWith('launchTempId');
    expect(finishPromise).toEqual('ok');
  });
});
