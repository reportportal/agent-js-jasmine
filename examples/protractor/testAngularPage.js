const { PublicReportingAPI } = require('../../lib/reportportal-agent');

describe('angularjs homepage', function() {
    PublicReportingAPI.addAttributes([{
        key: 'homepageKey1',
        value: 'homepageValue1'
    }]);

    it('should have a title', function() {
        PublicReportingAPI.addAttributes([{
            key: 'titleKey1',
            value: 'titleValue1'
        }]);

        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('AngularJS');
    });

    it('should have the correct title', function() {
        PublicReportingAPI.addAttributes([{
            key: 'titleKey2',
            value: 'titleValue2'
        }]);

        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('notAngular');
    });

    xit('should have the correct title, skipped', function() {
        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('notAngular');
    });
});

