const ReportportalAgent = require('../../lib/reportportal-agent.js');


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
    onPrepare(){
        agent = new ReportportalAgent({
            token: "00000000-0000-0000-0000-000000000000",
            endpoint: "http://your-instance.com:8080/api/v1",
            launch: "LAUNCH_NAME",
            project: "PROJECT_NAME",
            attachPicturesToLogs: false,
            id : browser.params.id
        });

        /*Its a hack. There is an issue since 2015. That Jasmine doesn't wait for report's async functions.
         links to the issues https://github.com/jasmine/jasmine/issues/842
         https://github.com/angular/protractor/issues/1938
         So it needed to wait until requests would be sent to the Report Portal.
         */
        afterAll((done) => agent.getAllClientPromises(agent.tempLaunchId).then(()=> done()));

        jasmine.getEnv().addReporter(agent.getJasmineReporter());
    }

};