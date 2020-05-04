const ClientPublicReportingAPI = require('reportportal-client/lib/publicReportingAPI');
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

describe('PublicReportingAPI', function() {
    it('should call clientPublicReportingApi.addAttributes method with attributes and undefined as parameter, if suite doesn\'t set', function() {
        spyOn(ClientPublicReportingAPI, 'addAttributes').and.returnValue(() => {});

        PublicReportingAPI.addAttributes([{ key: 'key', value: 'value' }]);

        expect(ClientPublicReportingAPI.addAttributes).toHaveBeenCalledWith([{ key: 'key', value: 'value' }], undefined);
    });

    it('should call clientPublicReportingApi.addAttributes method with attributes and suite as parameter', function() {
        spyOn(ClientPublicReportingAPI, 'addAttributes').and.returnValue(() => {});

        PublicReportingAPI.addAttributes([{ key: 'key', value: 'value' }], 'suite');

        expect(ClientPublicReportingAPI.addAttributes).toHaveBeenCalledWith([{ key: 'key', value: 'value' }], 'suite');
    });

    it('should call clientPublicReportingApi.setDescription method with text and undefined as parameters, if suite doesn\'t set', function() {
        spyOn(ClientPublicReportingAPI, 'setDescription').and.returnValue(() => {});

        PublicReportingAPI.setDescription('text');

        expect(ClientPublicReportingAPI.setDescription).toHaveBeenCalledWith('text', undefined);
    });

    it('should call clientPublicReportingApi.setDescription method with text and suite as parameters', function() {
        spyOn(ClientPublicReportingAPI, 'setDescription').and.returnValue(() => {});

        PublicReportingAPI.setDescription('text', 'suite');

        expect(ClientPublicReportingAPI.setDescription).toHaveBeenCalledWith('text', 'suite');
    });

    it('should call clientPublicReportingApi.setTestCaseId method with testCaseId and undefined as parameters, if suite doesn\'t set', function() {
        spyOn(ClientPublicReportingAPI, 'setTestCaseId').and.returnValue(() => {});

        PublicReportingAPI.setTestCaseId('testCaseId');

        expect(ClientPublicReportingAPI.setTestCaseId).toHaveBeenCalledWith('testCaseId', undefined);
    });

    it('should call clientPublicReportingApi.setTestCaseId method with testCaseId and suite as parameters', function() {
        spyOn(ClientPublicReportingAPI, 'setTestCaseId').and.returnValue(() => {});

        PublicReportingAPI.setTestCaseId('testCaseId', 'suite');

        expect(ClientPublicReportingAPI.setTestCaseId).toHaveBeenCalledWith('testCaseId', 'suite');
    });

    it('should call clientPublicReportingApi.addLog method with log and suite as parameters', function() {
        spyOn(ClientPublicReportingAPI, 'addLog').and.returnValue(() => {});

        PublicReportingAPI.log('INFO', 'message', null, 'suite');

        expect(ClientPublicReportingAPI.addLog).toHaveBeenCalledWith({ level: 'INFO', file: null, message: 'message' }, 'suite');
    });

    publicReportingAPILogMethods.forEach(item => {
        it(`should call clientPublicReportingApi.addLog method with ${item.level} level parameter if we run ${item.method} method`, function() {
            spyOn(ClientPublicReportingAPI, 'addLog').and.returnValue(() => {});

            PublicReportingAPI[item.method]('message', null, 'suite');

            expect(ClientPublicReportingAPI.addLog).toHaveBeenCalledWith({ level: item.level, file: null, message: 'message' }, 'suite');
        });
    });

    it('should call clientPublicReportingApi.addLaunchLog method with default parameters', function() {
        spyOn(ClientPublicReportingAPI, 'addLaunchLog').and.returnValue(() => {});

        PublicReportingAPI.launchLog();

        expect(ClientPublicReportingAPI.addLaunchLog).toHaveBeenCalledWith({ level: 'INFO', file: undefined, message: '' });
    });

    publicReportingAPILaunchLogMethods.forEach(item => {
        it(`should call clientPublicReportingApi.addLaunchLog method with ${item.level} level parameter if we run ${item.method} method`, function() {
            spyOn(ClientPublicReportingAPI, 'addLaunchLog').and.returnValue(() => {});

            PublicReportingAPI[item.method]();

            expect(ClientPublicReportingAPI.addLaunchLog).toHaveBeenCalledWith({ level: item.level, file: undefined, message: '' });
        });
    });
});
