'use strict';
/* global process */
/* Any type of launchers could be used, this is just for example as favorite one*/
const protractorFlake = require('protractor-flake');
const AgentJasmine = require('../../lib/reportportal-agent');
const reportportalConfig = require('./reportportalConf');
const agent = new AgentJasmine(reportportalConfig);

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