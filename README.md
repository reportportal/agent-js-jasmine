# @reportportal/agent-js-jasmine

Agent for integration Jasmine with ReportPortal.
[ReportPortal](http://reportportal.io/)<br>
[ReportPortal on GitHub](https://github.com/reportportal)

### How to use
1. Install the agent in your project:
```cmd
npm i @reportportal/agent-js-jasmine --save-dev
```
2. Create an agent instance:
```javascript
var ReportportalAgent = require('@reportportal/agent-js-jasmine');

var agent = new ReportportalAgent({
    // client settings
    token: "00000000-0000-0000-0000-000000000000",
    endpoint: "http://your.reportportal.server/api/v1",
    launch: "LAUNCH_NAME",
    project: "PROJECT_NAME",
    // agent settings
    attachPicturesToLogs: true,
    attributes: [
        {
            "key": "YourKey",
            "value": "YourValue"
        },
        {
            "value": "YourValue"
        },
    ]
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
reportHooks           | *Default: false.* Determines report before and after hooks or not.
skippedIssue | *Default: true.* ReportPortal provides feature to mark skipped tests as not 'To Investigate' items on WS side.<br> Parameter could be equal boolean values:<br> *TRUE* - skipped tests considered as issues and will be marked as 'To Investigate' on Report Portal.<br> *FALSE* - skipped tests will not be marked as 'To Investigate' on application.

To report [rerun](https://github.com/reportportal/documentation/blob/master/src/md/src/DevGuides/rerun.md) to the report portal you need to specify the following options:

Parameter | Description
--------- | -----------
rerun | to enable rerun
rerunOf | UUID of launch you want to rerun. If not specified, report portal will update the latest launch with the same name

Example:

```json
  "rerun": true,
  "rerunOf": "f68f39f9-279c-4e8d-ac38-1216dffcc59c"
```

### Additional reporting functionality

The agent provides an API to extend the functionality of Jasmine.

Add PublicReportingAPI into your test file to use additional reporting features.

```javascript
const PublicReportingAPI = require('@reportportal/agent-js-jasmine/lib/publicReportingAPI');
```

#### Report static attributes, description
Inside of your suite or spec call PublicReportingAPI.setDescription(), PublicReportingAPI.addAttributes()

**setDescription** method inside of your **suite**

Parameter | Required | Description | Examples
--------- | ----------- | ----------- | -----------
description | true | "string" - text description for your suite | "Your description"
suite | true | "string" - description of your suite (all suite descriptions must be unique) | "Suite"

**addAttributes** method inside of your **suite**

Parameter | Required | Description | Examples
--------- | ----------- | ----------- | -----------
attributes | true | attributes, pairs of key and value | [{ "key": "YourKey", "value": "YourValue" }]
suite | true | "string" - description of your suite (all suite descriptions must be unique) | "Suite"

**setDescription** method inside of your **spec**

Parameter | Required | Description | Examples
--------- | ----------- | ----------- | -----------
description | true | "string" - text description for your suite | "Your description"

**addAttributes** method inside of your **spec**

Parameter | Required | Description | Examples
--------- | ----------- | ----------- | -----------
attributes | true | attributes, pairs of key and value | [{ "key": "YourKey", "value": "YourValue" }]
To integrate with Sauce Labs just add attributes:

```javascript
[{
 "key": "SLID",
 "value": "# of the job in Sauce Labs"
}, {
 "key": "SLDC",
 "value": "EU (EU or US)"
}]
```

#### Report logs and attachments
PublicReportingAPI provides the following methods for reporting logs into the current suite/spec.

* log(*level*, *message* , *file*, *suite*). Reports *message* and optional *file* with specified log *level* as a log of the current suite/spec.<br/>
*level* should be equal to one of the following values: *TRACE*, *DEBUG*, *INFO*, *WARN*, *ERROR*, *FATAL*.<br/>
*suite* it's description of your suite (all suite descriptions must be unique) ***REQUIRED INSIDE OF YOUR SUITE, OPTIONAL FOR SPEC*** <br/>
*file* should be an object (***REQUIRED INSIDE OF YOUR SUITE,*** if there is no file object, set ***NULL***) : <br/>
```javascript
{
  name: "filename",
  type: "image/png",  // media type
  content: data,  // file content represented as 64base string
}
```
* trace (*message* , *file*, *suite*). Reports *message* and optional *file* as a log of the current suite/spec with trace log level.
* debug (*message* , *file*, *suite*). Reports *message* and optional *file* as a log of the current suite/spec with debug log level.
* info (*message* , *file*, *suite*). Reports *message* and optional *file* as log of the current suite/spec with info log level.
* warn (*message* , *file*, *suite*). Reports *message* and optional *file* as a log of the current suite/spec with warning log level.
* error (*message* , *file*, *suite*). Reports *message* and optional *file* as a log of the current suite/spec with error log level.
* fatal (*message* , *file*, *suite*). Reports *message* and optional *file* as a log of the current suite/spec with fatal log level.

PublicReportingAPI provides the corresponding methods for reporting logs into the launch.
* launchLog (*level*, *message* , *file*). Reports *message* and optional *file* with the specified log *level* as a log of the current launch.
* launchTrace (*message* , *file*). Reports *message* and optional *file* as a log of the launch with trace log level.
* launchDebug (*message* , *file*). Reports *message* and optional *file* as a log of the launch with debug log level.
* launchInfo (*message* , *file*). Reports *message* and optional *file* as log of the launch with info log level.
* launchWarn (*message* , *file*). Reports *message* and optional *file* as a log of the launch with warning log level.
* launchError (*message* , *file*). Reports *message* and optional *file* as a log of the launch with error log level.
* launchFatal (*message* , *file*). Reports *message* and optional *file* as a log of the launch with fatal log level.

#### Finish launch/suite/spec with status
PublicReportingAPI provides the following methods for setting status into the current suite/spec.

* setStatus(*status*, *suite*). Assign *status* to the current suite/spec.<br/>
*status* should be equal to one of the following values: *passed*, *failed*, *stopped*, *skipped*, *interrupted*, *cancelled*, *info*, *warn*.<br/>
*suite* it's description of your suite (all suite descriptions must be unique) ***REQUIRED INSIDE OF YOUR SUITE, OPTIONAL FOR SPEC*** <br/>

* setStatusPassed(). Assign *passed* status to the current suite/spec.
* setStatusFailed(). Assign *failed* status to the current suite/spec.
* setStatusSkipped(). Assign *skipped* status to the current suite/spec.
* setStatusStopped(). Assign *stopped* status to the current suite/spec.
* setStatusInterrupted(). Assign *interrupted* status to the current suite/spec.
* setStatusCancelled(). Assign *cancelled* status to the current suite/spec.
* setStatusInfo(). Assign *info* status to the current suite/spec.
* setStatusWarn(). Assign *warn* status to the current suite/spec.

PublicReportingAPI provides the corresponding methods for setting status into the launch.
* setLaunchStatus(*status*). Assign *status* to the launch.<br/>
*status* should be equal to one of the following values: *passed*, *failed*, *stopped*, *skipped*, *interrupted*, *cancelled*, *info*, *warn*.<br/>

* setLaunchStatusPassed(). Assign *passed* status to the launch.
* setLaunchStatusFailed(). Assign *failed* status to the launch.
* setLaunchStatusSkipped(). Assign *skipped* status to the launch.
* setLaunchStatusStopped(). Assign *stopped* status to the launch.
* setLaunchStatusInterrupted(). Assign *interrupted* status to the launch.
* setLaunchStatusCancelled(). Assign *cancelled* status to the launch.
* setLaunchStatusInfo(). Assign *info* status to the launch.
* setLaunchStatusWarn(). Assign *warn* status to the launch.

#### Report test case id for steps and suites

**setTestCaseId(*testCaseId*, *suite*)**. Set test case id to the current suite/spec. Should be called inside of corresponding suite or spec.</br>

*suite* it's description of your suite (all suite descriptions must be unique) ***REQUIRED INSIDE OF YOUR SUITE, OPTIONAL FOR SPEC*** <br/>


**Example:**
```javascript
const PublicReportingAPI = require('@reportportal/agent-js-jasmine/lib/publicReportingAPI');

describe('A suite', function() {
    const suiteAttachment = {
      name: 'attachment.png',
      type: 'image/png',
      content: data.toString('base64'),
    }
    PublicReportingAPI.addAttributes([{
        key: 'suiteKey',
        value: 'suiteValue',
    }], 'A suite');
    PublicReportingAPI.setDescription('Suite description', 'A suite');
    PublicReportingAPI.debug('Debug log message for suite "suite"', null, 'A suite');
    PublicReportingAPI.info('Info log message for suite "suite"', suiteAttachment, 'A suite');
    PublicReportingAPI.warn('Warning for suite "suite"', null, 'A suite');
    PublicReportingAPI.error('Error log message for suite "suite"', null, 'A suite');
    PublicReportingAPI.fatal('Fatal log message for suite "suite"', suiteAttachment, 'A suite');
    PublicReportingAPI.setLaunchStatusPassed();
    PublicReportingAPI.setStatusPassed('A suite');
    PublicReportingAPI.setTestCaseId('TestCaseIdForSuite', 'A suite');

    it('spec', function() {
        const specAttachment = {
          name: 'attachment.png',
          type: 'image/png',
          content: data.toString('base64'),
        }
        PublicReportingAPI.addAttributes([{
            key: 'specKey',
            value: 'specValue'
        }]);
        PublicReportingAPI.setDescription('Spec description');
        PublicReportingAPI.log('INFO', 'Info log message for spec "spec" with attachment', specAttachment);
        PublicReportingAPI.launchLog('ERROR', 'Error log message for current launch with attachment', specAttachment);
        PublicReportingAPI.trace('Trace log message for spec "spec"', specAttachment);
        PublicReportingAPI.debug('Debug log message for spec "spec"');
        PublicReportingAPI.info('Info log message for spec "spec" with attachment');
        PublicReportingAPI.warn('Warning for spec "spec"');
        PublicReportingAPI.error('Error log message for spec "spec"');
        PublicReportingAPI.fatal('Fatal log message for spec "spec"');
        PublicReportingAPI.setStatusPassed();
        PublicReportingAPI.setTestCaseId('TestCaseIdForSpec');

        expect(true).toBe(true);
    });
});
```

## Integrations
### Protractor integration
#### Launch agent in single thread mode.

If you launch protractor in single tread mode , just add agent initialization to the onPrepare function.
Add agent.getJasmineReporter to the  jasmine.getEnv().addReporter() as an argument. You can see this in the example bellow.
Update your configuration file as follows:
```javascript
const ReportportalAgent = require('@reportportal/agent-js-jasmine');

...
const agent = new ReportportalAgent({
        token: "00000000-0000-0000-0000-000000000000",
        endpoint: "http://your.reportportal.server/api/v1",
        launch: "LAUNCH_NAME",
        project: "PROJECT_NAME",
        attachPicturesToLogs: false,
        attributes: [
            {
                "key": "YourKey",
                "value": "YourValue"
            },
            {
                "value": "YourValue"
            },
        ]
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
    endpoint: "http://your.reportportal.server/api/v1",
    launch: "LAUNCH_NAME",
    project: "PROJECT_NAME",
    attachPicturesToLogs: false,
    attributes: [
        {
            "key": "YourKey",
            "value": "YourValue"
        },
        {
            "value": "YourValue"
        },
    ]
}
```

3. Create a main launch file as in example below:

protractorLaunchFile.js
```javascript
const protractorFlake = require('protractor-flake');
const AgentJasmine = require('@reportportal/agent-js-jasmine');
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
 const ReportportalAgent = require('@reportportal/agent-js-jasmine');
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
     specs: ['testAngularPage.spec.js', 'testGithubPage.spec.js'],
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

Link to the jasmine issue, that it doesn't work well with async functions
[jasmine issue](https://github.com/jasmine/jasmine/issues/842),
[protractor's community](https://github.com/angular/protractor/issues/1938)

# Copyright Notice
Licensed under the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.html)
license (see the LICENSE.txt file).


