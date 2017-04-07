
var ReportPortal = require('./jasmine-epam-reportportal-listener');
var l = require('./lock.js');

var reportPortalListener = new ReportPortal({
    token: "00000000-0000-0000-0000-000000000000",
    endpoint: "http://localhost:8080/api/v1",
    launch: "YOUR LAUNCH NAME",
    project: "YOUR PROJECT NAME",
    mode: "DEFAULT",
    tags: ["your", "tags"],
    description: "GO"
});

module.exports.config = {

    framework: 'jasmine2',

    capabilities: {
        'browserName': 'chrome'
    },

    plugins: [{
        path: './lock.js',
        inline: {
            postTest : function(passed, testInfo) {
                return reportPortalListener.completeInReportPortal();
            }
        }
    }],


    onPrepare: function() {

        global._ = require('lodash');
        global.defaultExplicitWait = 5000;
        jasmine.getEnv().addReporter(reportPortalListener);
    },

    allScriptsTimeout: 90000,

    specs: ['spec.js'],

    suites:{},

    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 300000,
        isVerbose: true,
        includeStackTrace: true,
        stopSpecOnExpectationFailure: true
    }

};
