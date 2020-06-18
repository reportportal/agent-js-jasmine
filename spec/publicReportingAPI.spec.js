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

const ClientPublicReportingAPI = require('@reportportal/client-javascript/lib/publicReportingAPI');
const PublicReportingAPI = require('../lib/publicReportingAPI');

const publicReportingAPILaunchLogMethods = [
    { method: 'launchTrace', level: 'TRACE' },
    { method: 'launchDebug', level: 'DEBUG' },
    { method: 'launchInfo', level: 'INFO' },
    { method: 'launchWarn', level: 'WARN' },
    { method: 'launchError', level: 'ERROR' },
    { method: 'launchFatal', level: 'FATAL' },
];
const publicReportingAPILogMethods = [
    { method: 'trace', level: 'TRACE' },
    { method: 'debug', level: 'DEBUG' },
    { method: 'info', level: 'INFO' },
    { method: 'warn', level: 'WARN' },
    { method: 'error', level: 'ERROR' },
    { method: 'fatal', level: 'FATAL' },
];
const publicReportingAPILaunchStatusMethods = [
    { method: 'setLaunchStatusPassed', status: 'passed' },
    { method: 'setLaunchStatusFailed', status: 'failed' },
    { method: 'setLaunchStatusSkipped', status: 'skipped' },
    { method: 'setLaunchStatusStopped', status: 'stopped' },
    { method: 'setLaunchStatusInterrupted', status: 'interrupted' },
    { method: 'setLaunchStatusCancelled', status: 'cancelled' },
    { method: 'setLaunchStatusInfo', status: 'info' },
    { method: 'setLaunchStatusWarn', status: 'warn' },
];
const publicReportingAPIStatusMethods = [
    { method: 'setStatusPassed', status: 'passed' },
    { method: 'setStatusFailed', status: 'failed' },
    { method: 'setStatusSkipped', status: 'skipped' },
    { method: 'setStatusStopped', status: 'stopped' },
    { method: 'setStatusInterrupted', status: 'interrupted' },
    { method: 'setStatusCancelled', status: 'cancelled' },
    { method: 'setStatusInfo', status: 'info' },
    { method: 'setStatusWarn', status: 'warn' },
];

describe('PublicReportingAPI', () => {
    it('should call clientPublicReportingApi.addAttributes method with attributes and undefined as parameter,'
        + ' if suite doesn\'t set', () => {
        spyOn(ClientPublicReportingAPI, 'addAttributes').and.returnValue(() => {});

        PublicReportingAPI.addAttributes([{ key: 'key', value: 'value' }]);

        expect(ClientPublicReportingAPI.addAttributes)
            .toHaveBeenCalledWith([{ key: 'key', value: 'value' }], undefined);
    });

    it('should call clientPublicReportingApi.addAttributes method with attributes and suite as parameter', () => {
        spyOn(ClientPublicReportingAPI, 'addAttributes').and.returnValue(() => {});

        PublicReportingAPI.addAttributes([{ key: 'key', value: 'value' }], 'suite');

        expect(ClientPublicReportingAPI.addAttributes).toHaveBeenCalledWith([{ key: 'key', value: 'value' }], 'suite');
    });

    it('should call clientPublicReportingApi.setDescription method with text and undefined as parameters,'
        + ' if suite doesn\'t set', () => {
        spyOn(ClientPublicReportingAPI, 'setDescription').and.returnValue(() => {});

        PublicReportingAPI.setDescription('text');

        expect(ClientPublicReportingAPI.setDescription).toHaveBeenCalledWith('text', undefined);
    });

    it('should call clientPublicReportingApi.setDescription method with text and suite as parameters', () => {
        spyOn(ClientPublicReportingAPI, 'setDescription').and.returnValue(() => {});

        PublicReportingAPI.setDescription('text', 'suite');

        expect(ClientPublicReportingAPI.setDescription).toHaveBeenCalledWith('text', 'suite');
    });

    it('should call clientPublicReportingApi.setTestCaseId method with testCaseId and undefined as parameters,'
        + ' if suite doesn\'t set', () => {
        spyOn(ClientPublicReportingAPI, 'setTestCaseId').and.returnValue(() => {});

        PublicReportingAPI.setTestCaseId('testCaseId');

        expect(ClientPublicReportingAPI.setTestCaseId).toHaveBeenCalledWith('testCaseId', undefined);
    });

    it('should call clientPublicReportingApi.setTestCaseId method with testCaseId and suite as parameters', () => {
        spyOn(ClientPublicReportingAPI, 'setTestCaseId').and.returnValue(() => {});

        PublicReportingAPI.setTestCaseId('testCaseId', 'suite');

        expect(ClientPublicReportingAPI.setTestCaseId).toHaveBeenCalledWith('testCaseId', 'suite');
    });

    it('should call clientPublicReportingApi.addLog method with log and suite as parameters', () => {
        spyOn(ClientPublicReportingAPI, 'addLog').and.returnValue(() => {});

        PublicReportingAPI.log('INFO', 'message', null, 'suite');

        expect(ClientPublicReportingAPI.addLog)
            .toHaveBeenCalledWith({ level: 'INFO', file: null, message: 'message' }, 'suite');
    });

    it('should call clientPublicReportingApi.addLog with default parameters if there are no custom ones', () => {
        spyOn(ClientPublicReportingAPI, 'addLog').and.returnValue(() => {});

        PublicReportingAPI.log();

        expect(ClientPublicReportingAPI.addLog)
            .toHaveBeenCalledWith({ level: 'INFO', file: undefined, message: '' }, undefined);
    });

    publicReportingAPILogMethods.forEach((item) => {
        it(`should call clientPublicReportingApi.addLog method with ${item.level}
         level parameter if we run ${item.method} method`, () => {
            spyOn(ClientPublicReportingAPI, 'addLog').and.returnValue(() => {});

            PublicReportingAPI[item.method]('message', null, 'suite');

            expect(ClientPublicReportingAPI.addLog)
                .toHaveBeenCalledWith({ level: item.level, file: null, message: 'message' }, 'suite');
        });
    });

    it('should call clientPublicReportingApi.addLaunchLog method with default parameters', () => {
        spyOn(ClientPublicReportingAPI, 'addLaunchLog').and.returnValue(() => {});

        PublicReportingAPI.launchLog();

        expect(ClientPublicReportingAPI.addLaunchLog)
            .toHaveBeenCalledWith({ level: 'INFO', file: undefined, message: '' });
    });

    publicReportingAPILaunchLogMethods.forEach((item) => {
        it(`should call clientPublicReportingApi.addLaunchLog method with ${item.level}
         level parameter if we run ${item.method} method`, () => {
            spyOn(ClientPublicReportingAPI, 'addLaunchLog').and.returnValue(() => {});

            PublicReportingAPI[item.method]();

            expect(ClientPublicReportingAPI.addLaunchLog)
                .toHaveBeenCalledWith({ level: item.level, file: undefined, message: '' });
        });
    });

    it('should call clientPublicReportingApi.setStatus method', () => {
        spyOn(ClientPublicReportingAPI, 'setStatus').and.returnValue(() => {});

        PublicReportingAPI.setStatus();

        expect(ClientPublicReportingAPI.setStatus).toHaveBeenCalled();
    });

    publicReportingAPIStatusMethods.forEach((item) => {
        it(`should call clientPublicReportingApi.setStatus method with ${item.status}
         status parameter if we run ${item.method} method`, () => {
            spyOn(ClientPublicReportingAPI, 'setStatus').and.returnValue(() => {});

            PublicReportingAPI[item.method]();

            expect(ClientPublicReportingAPI.setStatus).toHaveBeenCalledWith(item.status, undefined);
        });
    });

    it('should call clientPublicReportingApi.setLaunchStatus method', () => {
        spyOn(ClientPublicReportingAPI, 'setLaunchStatus').and.returnValue(() => {});

        PublicReportingAPI.setLaunchStatus();

        expect(ClientPublicReportingAPI.setLaunchStatus).toHaveBeenCalled();
    });

    publicReportingAPILaunchStatusMethods.forEach((item) => {
        it(`should call clientPublicReportingApi.setStatus method with ${item.status}
         status parameter if we run ${item.method} method`, () => {
            spyOn(ClientPublicReportingAPI, 'setLaunchStatus').and.returnValue(() => {});

            PublicReportingAPI[item.method]();

            expect(ClientPublicReportingAPI.setLaunchStatus).toHaveBeenCalledWith(item.status);
        });
    });
});
