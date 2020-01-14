const ReportportalAgent = require('../../lib/reportportal-agent.js');
let agent;


exports.config = {

    specs: ['testAngularPage.js', 'testGithubPage.js'],
    onPrepare(){
            agent = new ReportportalAgent({
            token: "00000000-0000-0000-0000-000000000000",
            endpoint: "http://your.reportportal.server/api/v1",
            launch: "LAUNCH_NAME",
            project: "PROJECT_NAME",
            description: 'YOUR_DESCRIPTION',
            attachPicturesToLogs: false,
            attributes: [
                {
                    "key": "yourKey",
                    "value": "yourValue"
                },
                {
                    "value": "yourValue"
                }
            ]
        });

        jasmine.getEnv().addReporter(agent.getJasmineReporter());
    },
    afterLaunch(number) {
        return agent.getExitPromise();
    },
};