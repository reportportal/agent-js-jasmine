'use strict';

var ReportPortalClient = require('reportportal-client');
var JasmineReportController = require('./jasmine-report-controller');
var _ = require('lodash');
var q = require('q');
var l = require('./lock.js');

class ReportPortal {

    constructor(conf) {
        this.reportPortal = new ReportPortalClient(conf);
        this.controller = new JasmineReportController();
        this.launch = undefined;
        this.currentSpec = undefined;
        this.lock = undefined;
    }

    waitForReportPortalLaunch() {
        return this.lock;
    }

    completeInReportPortal() {
        // Force protractor wait for spec
        setTimeout(function () { }, 500);
        return this.currentSpec;
    }

    jasmineStarted(info) {
        l.rpListener = this;
        this.totalSpecsToDo = info.totalSpecsDefined;
        var _self = this;
        var request = {
            name: _self.reportPortal.helpers.formatName(_self.reportPortal.config.launch),
            start_time: _self.reportPortal.helpers.now(),
            description: _self.reportPortal.config.description === undefined ? "" : _self.reportPortal.config.description,
            tags: _self.reportPortal.config.tags
        };
        this.launch = _self.reportPortal.startLaunch(request);
        browser.getCapabilities().then(function (caps) {
            _self.launch.then(function (launchId) {
                _self.reportPortal.updateLaunchDescription(launchId.id, [
                    caps.get('browserName'),
                    caps.get('version'),
                    caps.get('platform')
                ].join(" : "));
            });
        });
    }

    suiteStarted(suite) {

        var reportPortal = this.reportPortal;
        if (this.controller.isSuiteStackEmpty()) {
            this.controller.registerSuiteStarted(suite.id);
            var itemId = this.launch.then(function (launchId) {
                var request = {
                    name: reportPortal.helpers.formatName(suite.description),
                    launch_id: launchId.id,
                    start_time: reportPortal.helpers.now(),
                    type: "SUITE",
                    description: suite.fullName,
                    tags: reportPortal.config.tags
                };
                return reportPortal.startTestItem( request  );
            });
            this.controller.update(suite.id, { _self: itemId });
        } else {
            this.controller.registerSuiteStarted(suite.id);
            var parentSuite = this.controller.getParent(suite.id);
            var itemId = this.launch.then(function (launchId) {
                return parentSuite._self.then(function (parentId) {
                    var request = {
                        name: reportPortal.helpers.formatName(suite.description),
                        launch_id: launchId.id,
                        start_time: reportPortal.helpers.now(),
                        type: "TEST",
                        description: suite.fullName,
                        tags: reportPortal.config.tags
                    };
                    return reportPortal.startTestItem( request, parentId.id);
                });
            });
            this.controller.update(suite.id, { _self: itemId });
        }
    }

    specStarted(spec) {
        var reportPortal = this.reportPortal;
        this.controller.registerTestStarted(spec.id);
        var parentSuite = this.controller.getParent(spec.id);
        var testId = this.launch.then(function (launchId) {
            return parentSuite._self.then(function (parentId) {
                var request = {
                    name: reportPortal.helpers.formatName(spec.description),
                    launch_id: launchId.id,
                    start_time: reportPortal.helpers.now(),
                    type: "STEP",
                    description: spec.fullName,
                    tags: reportPortal.config.tags
                };
                return reportPortal.startTestItem(request, parentId.id);
            });
        });

        this.controller.update(spec.id, { _self: testId });
    }

    specDone(spec) {
        var reportPortal = this.reportPortal;
        var controller = this.controller;
        var _self = this;

        function finish(jasmineId) {
            _self.totalSpecsToDo--;
            controller.registerTestFinished(jasmineId);
            var item = controller.get(jasmineId);
            var itemId = item._self;
            var itemStatus = spec.status;
            if (spec.status === "pending" || spec.status === "disabled") {
                itemStatus = "skipped";
            }

            if (itemStatus === "failed") {

                var failures = [];
                var message;
                _.each(spec.failedExpectations, function (failure) {
                    failures.push( `message: ${failure.message.replace(/(?:\r\n|\r|\n)/g, "<br>")}`);
                    failures.push( `stackTrace: ${failure.stack.replace(/(?:\r\n|\r|\n)/g, "<br>")}`);
                });
                itemId.then(function (id) {
                    var request = {
                        item_id: id.id,
                        time: _self.reportPortal.helpers.now(),
                        level: "ERROR",
                        message: failures.join('<br>')
                    };
                    reportPortal.log( request);
                });
            }

            var finished = browser.takeScreenshot().then(function (png) {
                return png;
            }).then(function (png) {
                return itemId.then(function (id) {
                    var json = [{
                        item_id: id.id,
                        time: _self.reportPortal.helpers.now(),
                        level:  "INFO",
                        message: spec.fullName,
                        file: { name: spec.fullName }
                    }];
                    return reportPortal.sendFile(json, spec.fullName,  png, "image/png");
                });
            }).then(function (captured) {
                return itemId.then(function (id) {
                    var request = {
                        status: itemStatus,
                        end_time: _self.reportPortal.helpers.now()
                    };
                    return reportPortal.finishTestItem(id.id, request);
                });
            });

            _self.currentSpec = finished;
            controller.update(jasmineId, { finished: finished })
        }
        finish(spec.id);
    }

    suiteDone(suite) {
        var _self = this;
        var controller = this.controller;
        var reportPortal = this.reportPortal;

        controller.registerSuiteFinished(suite.id);

        function finish(jasmineId) {
            var item = controller.get(jasmineId);
            var itemId = item._self;
            return itemId.then(function (id) {
                var request = {
                    status:  "passed",
                    end_time: _self.reportPortal.helpers.now()
                };
                return reportPortal.finishTestItem(id.id, request);
            });
        }

        var syncClients = setInterval(function () {
            var root = _.first(controller.getFlatReport());
            var allDone = controller.allDone(suite.id);
            var unresolvedChild = _.filter(allDone, function (item) {
                return 'undefined' === typeof item;
            });
            if (unresolvedChild.length === 0) {

                _self.lock = Promise.all(allDone).then(function (values) {
                    var finished = finish(suite.id);
                    controller.update(suite.id, { finished: finished });
                    if (_self.totalSpecsToDo === 0) {
                        return finished.then(function (done) {
                            return _self.launch.then(function (lid) {
                                var request = {
                                    end_time: _self.reportPortal.helpers.now()
                                };
                                return reportPortal.finishLaunch(lid.id, request).then(function (result) {
                                    console.log("FINISHED JASMINE LAUNCH");
                                    l.resolve();
                                });
                            });
                        });
                    } else {
                        return l.getPromise();
                    }
                });
                clearInterval(syncClients);
            }
        }, 100);
    }
}

module.exports = ReportPortal;