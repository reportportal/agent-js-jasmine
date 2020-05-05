const ReportportalAgent = require('../../lib/reportportal-agent.js');
const reportportalConfig = require('./reportportalConf');
let agent;

exports.config = {
    specs: ['./*.spec.js'],
    onPrepare(){
        agent = new ReportportalAgent(reportportalConfig);

        jasmine.getEnv().addReporter(agent.getJasmineReporter());
    },
    afterLaunch(number) {
        return agent.getExitPromise();
    },
};