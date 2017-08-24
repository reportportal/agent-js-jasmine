'use strict';
/* global process */
/* Any type of launchers could be used, this is just for example as favorite one*/
const protractorFlake = require('protractor-flake');
const AgentJasmine = require('../../lib/reportportal-agent');
const agent = new AgentJasmine({
    token: "00000000-0000-0000-0000-000000000000",
    endpoint: "http://your-instance.com:8080/api/v1",
    launch: "LAUNCH_NAME",
    project: "PROJECT_NAME",
    attachPicturesToLogs: false
});

agent.getLaunchStartPromise().then((launchData) =>{
    protractorFlake({
        maxAttempts: 1,
        protractorArgs: [
            './multiThreadConf.js',
            '--params.id',
            launchData.id
        ]
    }, (status, output) => {
        // Close the report after all tests have finished
        agent.getExitPromise().then(() =>{
            process.exit(status);
        });
    });
});