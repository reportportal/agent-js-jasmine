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
    }
};

module.exports = SpecificUtils;