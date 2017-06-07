# agent-js-jasmine

Agent for integration Jasmine + Protractor with ReportPortal.     
[ReportPortal](http://reportportal.io/)<br>
[ReportPortal on GitHub](https://github.com/reportportal)

 You should include agent-js-jasmine as dependency in your package.json.

Your repository should include protractors' config file. You should add some lines in it:
1. Import agent-js-jasmine
```var AgentJasmine = require('agent-js-jasmine');```
2. Create object with configuration for ReportPortal
```sh
var reportPortalListener = new AgentJasmine({
    token: "00000000-0000-0000-0000-000000000000",
    endpoint: "http://localhost",
    launch: "LAUNCH NAME",
    project: "PROJECT NAME",
    mode: "DEFAULT",
    tags: ["your", "tags"],
    description: "DESCRIPTION"
});
```
3. Add some plugins
```sh
plugins: [{
        path:'node_modules/agent-js-jasmine/lock.js',
        inline: {
            postTest : function(passed, testInfo) {
                return reportPortalListener.completeInReportPortal();
            }
        }

    }]
```

4. Add custom reporter to Jasmine
```sh
 onPrepare: function(){
        global.defaultExplicitWait = 5000;
        jasmine.getEnv().addReporter(reportPortalListener);
    }
```

 

		
