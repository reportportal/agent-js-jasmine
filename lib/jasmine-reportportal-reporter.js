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
        this.suiteAdditionalCustomParams = {
            suiteAttributes: [],
            suiteDescription: [],
        };
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
        const attributes = this.additionalCustomParams.attributes
            ? { attributes: this.additionalCustomParams.attributes.concat(attr.attributes) }
            : attr;

        this.additionalCustomParams = Object.assign(this.additionalCustomParams, attributes);
    }

    setDescription(description) {
        const { suiteDescription } = this.suiteAdditionalCustomParams;

        if (description && description.text.suite) {
            this.suiteAdditionalCustomParams.suiteDescription = suiteDescription.concat(description.text);
        } else {
            this.additionalCustomParams = Object.assign(this.additionalCustomParams, description && { description: description.text });
        }
    }

    registerListeners () {
        process.on(EVENTS.ADD_ATTRIBUTES, this.addAttributes.bind(this));
        process.on(EVENTS.ADD_DESCRIPTION, this.setDescription.bind(this));
    }

    getSuiteAttributesBySuite (suite) {
        const { suiteAttributes } = this.suiteAdditionalCustomParams;

        return suiteAttributes && suiteAttributes.filter(attr => attr.suite === suite).map(attr => ({
            key: attr.key,
            value: attr.value,
        }));
    }

    getSuiteDescriptionBySuite (suite) {
        const { suiteDescription } = this.suiteAdditionalCustomParams;

        return suiteDescription && suiteDescription.filter(text => text.suite === suite).map(item => item.text);
    }

    suiteStarted(suite) {
        const suiteTitle = suite.description;

        if (!(this.suiteAdditionalCustomParams.suiteAttributes && this.suiteAdditionalCustomParams.suiteAttributes.length)) {
            this.suiteAdditionalCustomParams.suiteAttributes = this.additionalCustomParams.attributes;
        }

        const { suiteAttributes, suiteDescription } = this.suiteAdditionalCustomParams;
        const attributes = this.getSuiteAttributesBySuite(suiteTitle);
        const description = this.getSuiteDescriptionBySuite(suiteTitle);

        this.suiteAdditionalCustomParams.suiteAttributes = suiteAttributes && suiteAttributes.slice(attributes.length);
        this.suiteAdditionalCustomParams.suiteDescription = suiteDescription && suiteDescription.slice(description.length);

        let type = this.getTopLevelType();
        let suiteObj = this.client.startTestItem(Object.assign({
            type,
            description: suiteTitle,
            name: suite.fullName
        },
            attributes && attributes.length && { attributes },
            description.length && { description: description[0] }), this.tempLaunchId, this.getParentId());
        this.setParentId(suiteObj.tempId);
        this.additionalCustomParams = {};
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