# agent-js-jasmine
[![Build Status](https://travis-ci.org/reportportal/agent-js-jasmine.svg?branch=master)](https://travis-ci.org/reportportal/agent-js-jasmine)[![Code Coverage](https://codecov.io/gh/reportportal/agent-js-jasmine/branch/master/graph/badge.svg)](https://codecov.io/gh/reportportal/agent-js-jasmine)[![npm version](https://badge.fury.io/js/agent-js-jasmine.svg)](https://badge.fury.io/js/agent-js-jasmine)

Agent for integration Jasmine with ReportPortal.     
[ReportPortal](http://reportportal.io/)<br>
[ReportPortal on GitHub](https://github.com/reportportal)

### How to use
1. Install the agent in your project:
```cmd
npm i agent-js-jasmine --save-dev
```
2. Create an agent instance:
```javascript
var ReportportalAgent = require('agent-js-jasmine');

var agent = new ReportportalAgent({
    // client settings
    token: "00000000-0000-0000-0000-000000000000",
    endpoint: "http://your-instance.com:8080/api/v1",
    launch: "LAUNCH_NAME",
    project: "PROJECT_NAME",
    // agent settings
    attachPicturesToLogs: true,
});
```
3. Add a reporter to Jasmine:
```javascript
jasmine.addReporter(agent.getJasmineReporter());
```
4. After Jasmine has completed its work, wait until the end of the agent's work:
```javascript
agent.getExitPromise().then(() => {
    console.log('finish work');
})
```

### Settings
Agent settings consist of two parts:
* Client settings can be viewed [here](https://github.com/reportportal/client-javascript#settings)
* Agent settings are described below

Parameter | Description
--------- | -----------
attachPicturesToLogs | It is 'true' or 'false', if set 'true' then attempts will be made to attach screenshots to the logs. Default: 'true'.


## Integrations
### Protractor integration
#### Launch agent in single thread mode.

If you launch protractor in single tread mode , just add agent initialization to the onPrepare function.
Add agent.getJasmineReporter to the  jasmine.getEnv().addReporter() as an argument. You can see this in the example bellow.
Update your configuration file as follows:
```javascript
var ReportportalAgent = require('agent-js-jasmine');

...
exports.config = {
    ...
    onPrepare: ()=> {
    let agent = new ReportportalAgent({
        token: "00000000-0000-0000-0000-000000000000",
        endpoint: "http://your-instance.com:8080/api/v1",
        launch: "LAUNCH_NAME",
        project: "PROJECT_NAME",
        attachPicturesToLogs: false
    });
        ...
        jasmine.getEnv().addReporter(agent.getJasmineReporter());
    },
    afterLaunch:() => {
        return agent.getExitPromise();
    }
};
```

#### Launch agents in multi thread mode.

 For launching agents in multi thread mode firstly parent launch must be created and it ID
 must be sent to the child launches , so they would send data to the right place, and wouldn't create new
 launch instances at the Report Portal.
 
 The main problem is that node.js is a single threaded platform. And for providing multi treading launch with browsers protractor generate
 new processes  of node, which can't interact with each other, so Singelton objects or functions can't be created for synchronizing
 it work. Only primitive types could be sent as args to the new processes before launch. The way of resolving this problem is
 to create launch file that would generate a Parent Launch and send launch's ID to protractor as argument. Then protractor would
 launch jasmine-agents with parent ID.
 Look throug example of the Launch File with protractor-flake module at the 'Settings fot the multi threaded launch' section or at the examples folder.
 Any node runner could be used!

 Create a main launch file as in example below:

launchFile.js

```javascript
'use strict';
/* global process */
const protractorFlake = require('protractor-flake');
const AgentJasmine = require('agent-js-jasmine');
const agent = new AgentJasmine({
               token: "00000000-0000-0000-0000-000000000000",
               endpoint: "http://your-instance.com:8080/api/v1",
               launch: "LAUNCH_NAME",
               project: "PROJECT_NAME",
               attachPicturesToLogs: false,
               tags: ["your", "tags"],
               description: "DESCRIPTION"
});
    agent.startLaunch().then((realID) =>{
            protractorFlake({
                protractorArgs: [
                    './protractorSpecFile.js',
                    '--params.id',
                    realID.id
                ]
            }, (status, output) => {
                // Close the report after all tests finish
               agent.getExitPromise().then(() =>{
                   process.exit(status);
               });

             });
    });
```

Then create protractor's spec file as in example below:

protractorSpecFile.js file

```javascript
 onPrepare(){
        agent = new AgentJasmine({
            token: "00000000-0000-0000-0000-000000000000",
            endpoint: "http://your-instance.com:8080/api/v1",
            launch: "LAUNCH_NAME",
            project: "PROJECT_NAME",
            attachPicturesToLogs: false,
            id : browser.params.id
        });


        /*Its a hack. There is an issue since 2015. That Jasmine doesn't wait for report's async functions.
         So it needed to wait until requests would be sent to the Report Portal.
         */
        afterAll((done) => agent. getAllClientPromises(agent.tempLaunchId).then(()=> done()));

        jasmine.getEnv().addReporter(agent.getJasmineReporter());
    },
```
Link to the jasmine issue , that it doesn't work well with async functions
[jasmine issue](https://github.com/jasmine/jasmine/issues/842), 
[protractor's community](https://github.com/angular/protractor/issues/1938)

# Copyright Notice
Licensed under the [GPLv3](https://www.gnu.org/licenses/quick-guide-gplv3.html)
license (see the LICENSE.txt file).

		
