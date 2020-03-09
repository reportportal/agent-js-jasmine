const SpecificUtils = require('../lib/specificUtils');

describe('Specific Utils', function() {
    it('should return promise if browser is false, promise resolve should be null', function() {
        browser = false;

        const promise = SpecificUtils.takeScreenshot('fileName');

        expect(promise.then).toBeDefined();
        promise.then(function (value) {
            expect(value).toEqual(null);
        });
    });

    it('should call browser.takeScreenshot if browser is true', function() {
        browser = jasmine.createSpyObj('browser', {
            'takeScreenshot': new Promise(function() {})
        });

        SpecificUtils.takeScreenshot('fileName');

        expect(browser.takeScreenshot).toHaveBeenCalled();
    });

    it('if browser is true and browser.takeScreenshot is successful, promise resolve should be object', function() {
        const expectedPromiseResolvedObj = {
            name: 'fileName',
            type: 'image/png',
            content: 'png'
        };
        browser = jasmine.createSpyObj('browser', {
            'takeScreenshot': Promise.resolve('png')
        });

        const promise = SpecificUtils.takeScreenshot('fileName');

        expect(browser.takeScreenshot).toHaveBeenCalled();
        promise.then(function (value) {
            expect(value).toEqual(expectedPromiseResolvedObj);
        });
    });

    it('if browser is true and browser.takeScreenshot is unsuccessful, promise resolve should be null', function() {
        browser = jasmine.createSpyObj('browser', {
            'takeScreenshot': Promise.reject()
        });

        const promise = SpecificUtils.takeScreenshot('fileName');

        expect(browser.takeScreenshot).toHaveBeenCalled();
        promise.then(function (value) {
            expect(value).toEqual(null);
        });
    });
});
