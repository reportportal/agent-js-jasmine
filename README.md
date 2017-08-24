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
const ReportportalAgent = require('agent-js-jasmine');

...
const agent = new ReportportalAgent({
        token: "00000000-0000-0000-0000-000000000000",
        endpoint: "http://your-instance.com:8080/api/v1",
        launch: "LAUNCH_NAME",
        project: "PROJECT_NAME",
        attachPicturesToLogs: false
    });
exports.config = {
    ...
    onPrepare: ()=> {
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
 Look through example of the Launch File with protractor-flake module at the 'Settings fot the multi threaded launch' section or at the examples folder.
 Any node runner could be used!
 
1. Install 'protractor-flake':
```bash
npm install protractor-flake --save-dev
```
 
2. Create a config file as in example below:

reportportalConf.js
```javascript
module.exports = {
    token: "00000000-0000-0000-0000-000000000000",
    endpoint: "http://your-instance.com:8080/api/v1",
    launch: "LAUNCH_NAME",
    project: "PROJECT_NAME",
    attachPicturesToLogs: false
}
```

3. Create a main launch file as in example below:

protractorLaunchFile.js
```javascript
const protractorFlake = require('protractor-flake');
const AgentJasmine = require('agent-js-jasmine');
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
    }, (status) => {
        agent.getExitPromise().then(() =>{
            process.exit(status);
        });
    });
});
```

4. Then create protractor's spec file as in example below:

multiThreadConf.js file

```javascript
 const ReportportalAgent = require('agent-js-jasmine');
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
```

5. Update script section for your package.json:
```javascript
"scripts": {
    "protractor-multi": "node protractorLaunchFile.js"
 }
```

6. Run your protractor:
```bash
npm run protractor-multi
```


Link to the jasmine issue , that it doesn't work well with async functions
[jasmine issue](https://github.com/jasmine/jasmine/issues/842), 
[protractor's community](https://github.com/angular/protractor/issues/1938)

# Copyright Notice
Licensed under the [GPLv3](https://www.gnu.org/licenses/quick-guide-gplv3.html)
license (see the LICENSE.txt file).

		
