# agent-js-jasmine
[![Build Status](https://travis-ci.org/reportportal/agent-js-jasmine.svg?branch=master)](https://travis-ci.org/reportportal/agent-js-jasmine)[![Code Coverage](https://codecov.io/gh/reportportal/agent-js-jasmine/branch/master/graph/badge.svg)](https://codecov.io/gh/reportportal/agent-js-jasmine)[![npm version](https://badge.fury.io/js/agent-js-jasmine.svg)](https://badge.fury.io/js/agent-js-jasmine)

Agent for integration Jasmine + Protractor with ReportPortal.     
[ReportPortal](http://reportportal.io/)<br>
[ReportPortal on GitHub](https://github.com/reportportal)

### How to use
1. Install the agent in your project:
```npm i agent-js-jasmine --save-dev```
2. Modify the protractor configuration file as follows:

```javascript
...
var AgentJasmine = require('agent-js-jasmine');

var reportPortalListener = new AgentJasmine({
    token: "00000000-0000-0000-0000-000000000000",
    endpoint: "http://localhost",
    launch: "LAUNCH NAME",
    project: "PROJECT NAME",
    mode: "DEFAULT",
    tags: ["your", "tags"],
    description: "DESCRIPTION"
});
...
module.exports.config = {
    ...
    plugins: [{
            path:'node_modules/agent-js-jasmine/lock.js',
            inline: {
                postTest : function(passed, testInfo) {
                    return reportPortalListener.completeInReportPortal();
                }
            }
    
        }]
    ...
    onPrepare: function(){
        ...
        global.defaultExplicitWait = 5000;
        jasmine.getEnv().addReporter(reportPortalListener);
    }
    ...
}
```

token - UUID in your ReportPortal profile page.
endpoint - server address reportPortal.

3. Open ReportPortal, your project and launch. You should see report about tests results.


		
