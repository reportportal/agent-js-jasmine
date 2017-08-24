const ReportportalAgent = require('../../lib/reportportal-agent.js');
const reportportalConfig = require('./reportportalConf');

exports.config = {
    multiCapabilities: [
        {
            name: 'normal',
            browserName: 'chrome',
            maxInstances: 2,
            shardTestFiles: true,
            chromeOptions: {
                args: ['--window-size=1024,768', '--disable-infobars']
            }
        }
    ],
    specs: ['testAngularPage.js', 'testGithubPage.js'],
    onPrepare() {
        const config = Object.assign({
            id: browser.params.id
        }, reportportalConfig);
        const agent = new ReportportalAgent(config);
        /*Its a hack. There is an issue since 2015. That Jasmine doesn't wait for report's async functions.
         links to the issues https://github.com/jasmine/jasmine/issues/842
         https://github.com/angular/protractor/issues/1938
         So it needed to wait until requests would be sent to the Report Portal.
         */
        afterAll((done) => agent.getPromiseFinishAllItems(agent.tempLaunchId).then(()=> done()));
        jasmine.getEnv().addReporter(agent.getJasmineReporter());
    }

};