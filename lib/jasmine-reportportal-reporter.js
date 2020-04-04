const SpecificUtils = require('./specificUtils');
const { EVENTS } = require('reportportal-client/lib/events');

const promiseErrorHandler = promise => {
    promise.catch(err => {
        console.error(err);
    });
};

class ReportportalReporter {
    constructor(conf) {
        this.client = conf.client;
        this.tempLaunchId = conf.tempLaunchId;
        this.parentIds = [];
        this.conf = conf;
        this.registerListeners();
        this.additionalCustomParams = {};
        this.suiteDescription = new Map();
        this.suiteAttributes = new Map();
    }

    escapeMarkdown(string) {
        return string.replace(/_/gm, '\\_').replace(/\*/gm, '\\*');
    }

    getParentId() {
        if (!this.parentIds.length) {
            return null;
        }
        return this.parentIds[this.parentIds.length - 1];
    }

    setParentId(id) {
        this.parentIds.push(id);
    }

    finishParent() {
        this.parentIds.pop();
    }

    getTopLevelType() {
        if (!this.parentIds.length) {
            return 'SUITE';
        }
        return 'TEST';
    }

    addAttributes(attr) {
        if (attr && attr.suite) {
            const attributes = (this.suiteAttributes.get(attr.suite) || []).concat(attr.attributes);

            this.suiteAttributes.set(attr.suite, attributes);
        } else {
            const attributes = this.additionalCustomParams.attributes
                ? { attributes: this.additionalCustomParams.attributes.concat(attr.attributes) }
                : attr;

            this.additionalCustomParams = Object.assign(this.additionalCustomParams, attributes);
        }
    }

    setDescription(description) {
        if (description && description.suite) {
            this.suiteDescription.set(description.suite, description.text);
        } else {
            this.additionalCustomParams = Object.assign(this.additionalCustomParams, description && { description: description.text });
        }
    }

    registerListeners () {
        process.on(EVENTS.ADD_ATTRIBUTES, this.addAttributes.bind(this));
        process.on(EVENTS.SET_DESCRIPTION, this.setDescription.bind(this));
    }

    getSuiteAttributesBySuite (suite) {
        return this.suiteAttributes.get(suite);
    }

    getSuiteDescriptionBySuite (suite) {
        return this.suiteDescription.get(suite);
    }

    suiteStarted(suite) {
        const suiteTitle = suite.description;

        const attributes = this.getSuiteAttributesBySuite(suiteTitle);
        const description = this.getSuiteDescriptionBySuite(suiteTitle);

        let type = this.getTopLevelType();
        let suiteObj = this.client.startTestItem(Object.assign({
            type,
            description: suiteTitle,
            name: suite.fullName
        },
            attributes && { attributes },
            description && { description }), this.tempLaunchId, this.getParentId());
        this.setParentId(suiteObj.tempId);

        this.additionalCustomParams = {};
        this.suiteAttributes.delete(suiteTitle);
        this.suiteDescription.delete(suiteTitle);

        promiseErrorHandler(suiteObj.promise);
    }

    specStarted(spec) {
        let stepObj = this.client.startTestItem({
            type: 'STEP',
            description: spec.description,
            name: spec.fullName
        }, this.tempLaunchId, this.getParentId());
        this.setParentId(stepObj.tempId);
        promiseErrorHandler(stepObj.promise);
    }
    specDone(spec) {
        const { attributes, description } = this.additionalCustomParams;
        let status = spec.status;
        if (status === 'pending' || status === 'disabled') {
            status = 'skipped';
        }
        let level = '';
        let message = spec.fullName;
        if (status === 'failed') {
            level = 'ERROR';
            let failures = [];
            spec.failedExpectations.forEach((failure) => {
                failures.push(`message: ${this.escapeMarkdown(failure.message)}`);
                failures.push(`stackTrace: ${this.escapeMarkdown(failure.stack)}`);
            });
            message = failures.join('\n');
        }
        let parentId = this.getParentId();
        let promise = Promise.resolve(null);
        if (this.conf.attachPicturesToLogs) {
            promise = SpecificUtils.takeScreenshot(spec.fullName);
        }
        promise.then((fileObj) => {
            let sendLogPromise = this.client.sendLog(parentId, {
                message,
                level
            }, fileObj);
            promiseErrorHandler(sendLogPromise.promise);

            let finishTestItemPromise = this.client.finishTestItem(parentId, Object.assign({
                status
            }, attributes && { attributes }, description && { description }));
            promiseErrorHandler(finishTestItemPromise.promise);
        });

        this.additionalCustomParams = {};
        this.finishParent();
    }

    suiteDone() {
        let suiteDonePromise = this.client.finishTestItem(this.getParentId(), {});

        promiseErrorHandler(suiteDonePromise.promise);
        this.finishParent();
    }
}

module.exports = ReportportalReporter;