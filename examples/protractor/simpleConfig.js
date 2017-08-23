var ReportportalAgent = require('../../lib/reportportal-agent.js');

var agent = new ReportportalAgent({
    token: "00000000-0000-0000-0000-000000000000",
    endpoint: "http://your-instance.com:8080/api/v1",
    launch: "LAUNCH_NAME",
    project: "PROJECT_NAME",
    attachPicturesToLogs: false
});

exports.config = {
    specs: ['testAngularPage.js', 'testGithubPage.js'],
    onPrepare(){
        jasmine.getEnv().addReporter(agent.getJasmineReporter());
    },
    afterLaunch(number) {
        return agent.getExitPromise();
    },
};