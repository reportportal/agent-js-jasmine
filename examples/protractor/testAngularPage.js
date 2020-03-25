const PublicReportingAPI = require('../../lib/publicReportingAPI');

describe('angularjs homepage', function() {
    PublicReportingAPI.addAttributes([{
        key: 'homepageKey1',
        value: 'homepageValue1',
        suite: 'angularjs homepage',
    }]);
    PublicReportingAPI.addAttributes([{
        key: 'homepageKey2',
        value: 'homepageValue2',
        suite: 'angularjs homepage',
    }]);
    PublicReportingAPI.addDescription({ text: 'Homepage description', suite: 'angularjs homepage' });

    describe('describe', function () {
        PublicReportingAPI.addAttributes([{
            key: 'describeKey',
            value: 'describeValue',
            suite: 'describe',
        }]);
        PublicReportingAPI.addDescription({ text: 'Describe description', suite: 'describe' });

        it('spec', function() {
            PublicReportingAPI.addAttributes([{
                key: 'specKey',
                value: 'specValue'
            }]);
            PublicReportingAPI.addDescription('Spec description');

            expect(true).toBe(true);
        });
    });

    describe('describe1', function () {
        PublicReportingAPI.addAttributes([{
            key: 'describeKey1',
            value: 'describeValue1',
            suite: 'describe1',
        }]);
        PublicReportingAPI.addDescription({ text: 'Describe1 description', suite: 'describe1' });

        it('spec', function() {
            PublicReportingAPI.addAttributes([{
                key: 'specKey',
                value: 'specValue'
            }]);
            PublicReportingAPI.addDescription('Spec1 description');

            expect(true).toBe(true);
        });
    });

    describe('describe2', function () {
        it('spec', function() {
            PublicReportingAPI.addAttributes([{
                key: 'specKey',
                value: 'specValue'
            }]);
            PublicReportingAPI.addDescription('Spec3 description');

            expect(true).toBe(true);
        });
    });

    describe('describe3', function () {
        PublicReportingAPI.addAttributes([{
            key: 'describeKey3',
            value: 'describeValue3',
            suite: 'describe3',
        }]);
        PublicReportingAPI.addAttributes([{
            key: 'describeKey4',
            value: 'describeValue4',
            suite: 'describe3',
        }]);
        PublicReportingAPI.addDescription({ text: 'Describe3 description', suite: 'describe3' });

        it('spec', function() {
            PublicReportingAPI.addAttributes([{
                key: 'specKey',
                value: 'specValue'
            }]);
            PublicReportingAPI.addDescription('Spec2 description');

            expect(true).toBe(true);
        });
    });

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
            key: 'titleKey3',
            value: 'titleValue3'
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

