const PublicReportingAPI = require('../../lib/publicReportingAPI');

describe('angularjs homepage', function() {
    PublicReportingAPI.addAttributes([{
        key: 'homepageKey1',
        value: 'homepageValue1'
    }]);
    PublicReportingAPI.addAttributes([{
        key: 'homepageKey2',
        value: 'homepageValue2'
    }]);
    PublicReportingAPI.addDescription('Homepage description');

    it('should have a title', function() {
        PublicReportingAPI.addAttributes([{
            key: 'titleKey1',
            value: 'titleValue1'
        }, {
            key: 'titleKey2',
            value: 'titleValue2'
        }]);
        PublicReportingAPI.addDescription('Title one description');

        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('AngularJS');
    });

    it('should have the correct title', function() {
        PublicReportingAPI.addAttributes([{
            key: 'titleKey2',
            value: 'titleValue2'
        }]);
        PublicReportingAPI.addDescription('Title two description');

        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('notAngular');
    });

    xit('should have the correct title, skipped', function() {
        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('notAngular');
    });
});

