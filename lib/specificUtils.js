const { RPStatuses } = require('./constants/testStatuses');
const pjson = require('./../package.json');

const PJSON_VERSION = pjson.version;
const PJSON_NAME = pjson.name;

const SpecificUtils = {
    takeScreenshot(fileName) {
        let promiseResolve;
        let promise = new Promise((resolve, reject) => {
            promiseResolve = resolve;
        });
        if (browser) {
            browser.takeScreenshot().then((png) => {
                promiseResolve({
                    name: fileName,
                    type: 'image/png',
                    content: png
                });
            }, (error) => {
                console.dir(error);
                promiseResolve(null);
            })
        }
        else {
            promiseResolve(null);
        }
        return promise;
    },

    getLaunchObj(conf) {
        const systemAttr = this.getSystemAttributes();
        const launchObj = Object.assign(
            {
                attributes: conf.attributes ? [...conf.attributes, ...systemAttr] : systemAttr,
                description: conf.description
            },
            conf.id && { id: conf.id },
            conf.rerun && { rerun: conf.rerun },
            conf.rerunOf && { rerunOf: conf.rerunOf }
        );

        return launchObj;
    },

    getSystemAttributes() {
        return [{
            key: 'agent',
            value: `${PJSON_NAME}|${PJSON_VERSION}`,
            system: true,
        }];
    },

    getAgentInfo() {
        return {
            version: PJSON_VERSION,
            name: PJSON_NAME,
        }
    },

    isPromise(obj) {
        return !!obj && (typeof obj === 'object' || typeof obj === 'function')
            && typeof obj.then === 'function';
    },

    isHookShouldBeCalled(action) {
        return !(this.isPromise(action) && action !== undefined && action.valueOf() === undefined);
    },

    makeHooksWrapper(wrapped, funcStart, funcFinish) {
        return function (action, timeout) {
            wrapped(function (done) {
                let isFuncBeCalled = true;

                try {
                    isFuncBeCalled = SpecificUtils.isHookShouldBeCalled(action(done));

                    if (isFuncBeCalled) {
                        funcStart();
                        funcFinish();
                    }

                    done();
                } catch (err) {
                    if (isFuncBeCalled) {
                        funcStart();
                        funcFinish(RPStatuses.FAILED, err);
                    }

                    done.fail(err);
                }
            }, timeout);
        }
    }
};

module.exports = SpecificUtils;