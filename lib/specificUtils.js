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
    }
};

module.exports = SpecificUtils;