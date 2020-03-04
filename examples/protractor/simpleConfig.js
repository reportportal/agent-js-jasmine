const { ReportportalAgent } = require('../../lib/reportportal-agent.js');
const reportportalConfig = require('./reportportalConf');
let agent;

exports.config = {
    specs: ['testAngularPage.js', 'testGithubPage.js'],
    onPrepare(){
        agent = new ReportportalAgent(reportportalConfig);

        jasmine.getEnv().addReporter(agent.getJasmineReporter());
    },
    afterLaunch(number) {
        return agent.getExitPromise();
    },
};