const { ReportportalAgent } = require('../lib/reportportal-agent');
const reporterOptions = {
    token: '00000000-0000-0000-0000-000000000000',
    endpoint: 'endpoint',
    project: 'projectName',
    launch: 'launcherName',
    description: 'description',
    attributes: [
        {
            'key': 'YourKey',
            'value': 'YourValue'
        },
        {
            'value': 'YourValue'
        }
    ]
};
const options = Object.assign(reporterOptions, {
    id: 'id',
    rerun: true,
    rerunOf: 'rerunOf'
});

describe('Report Portal agent', function() {
    let agent;

    beforeEach(function() {
        agent = new ReportportalAgent(options);
    });

    it('should be properly initialized', function() {
        expect(agent.tempLaunchId).toBeDefined();
        expect(agent.client).toBeDefined();
    });

    it('getJasmineReporter should return instance of JasmineReportportalReporter', function() {
        const instanceJasmineReportportalReporter = agent.getJasmineReporter();

        expect(instanceJasmineReportportalReporter).toBeDefined();
        expect(instanceJasmineReportportalReporter.client).toBeDefined();
        expect(instanceJasmineReportportalReporter.parentIds).toEqual([]);
    });

    it('getLaunchStartPromise should return promise', function() {
        spyOn(agent.launchInstance, 'promise').and.returnValue(Promise.resolve('ok'));

        const launchStartPromise = agent.getLaunchStartPromise();

        expect(launchStartPromise().then).toBeDefined();
    });

    it('getExitPromise should return promise', function() {
        expect((agent.getExitPromise()).then).toBeDefined();
    });

    it('getPromiseFinishAllItems should return client.getPromiseFinishAllItems', function() {
        spyOn(agent.client, 'getPromiseFinishAllItems').and.returnValue({
            promise: Promise.resolve('ok'),
        });

        agent.getPromiseFinishAllItems('launchTempId');

        expect(agent.client.getPromiseFinishAllItems).toHaveBeenCalledWith('launchTempId');
    });
});
