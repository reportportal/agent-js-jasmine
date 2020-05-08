const PublicReportingAPI = require('../../lib/publicReportingAPI');

describe('testAngularPage', function() {
    PublicReportingAPI.addAttributes([{
        key: 'homepageKey1',
        value: 'homepageValue1',
    }], 'testAngularPage');
    PublicReportingAPI.addAttributes([{
        key: 'homepageKey2',
        value: 'homepageValue2',
    }], 'testAngularPage');
    PublicReportingAPI.setDescription('Homepage description', 'testAngularPage');
    PublicReportingAPI.setTestCaseId('TestCaseIdForAngularHomepageSuite', 'testAngularPage');

    describe('describe', function () {
        PublicReportingAPI.addAttributes([{
            key: 'describeKey',
            value: 'describeValue',
        }], 'describe');
        PublicReportingAPI.setDescription('Describe description', 'describe');

        it('spec', function() {
            PublicReportingAPI.addAttributes([{
                key: 'specKey',
                value: 'specValue'
            }]);
            PublicReportingAPI.setDescription('Spec description');
            PublicReportingAPI.setTestCaseId('TestCaseIdForSpec');

            expect(true).toBe(true);
        });
    });

    describe('describe1', function () {
        PublicReportingAPI.addAttributes([{
            key: 'describeKey1',
            value: 'describeValue1',
        }], 'describe1');
        PublicReportingAPI.setDescription('Describe1 description', 'describe1');

        it('spec', function() {
            PublicReportingAPI.addAttributes([{
                key: 'specKey',
                value: 'specValue'
            }]);
            PublicReportingAPI.setDescription('Spec1 description');

            expect(true).toBe(true);
        });
    });

    describe('describe2', function () {
        it('spec', function() {
            PublicReportingAPI.addAttributes([{
                key: 'specKey',
                value: 'specValue'
            }]);
            PublicReportingAPI.setDescription('Spec3 description');

            expect(true).toBe(true);
        });
    });

    describe('describe3', function () {
        PublicReportingAPI.addAttributes([{
            key: 'describeKey3',
            value: 'describeValue3',
        }], 'describe3');
        PublicReportingAPI.addAttributes([{
            key: 'describeKey4',
            value: 'describeValue4',
        }], 'describe3');
        PublicReportingAPI.setDescription('Describe3 description', 'describe3');

        it('spec', function() {
            PublicReportingAPI.addAttributes([{
                key: 'specKey',
                value: 'specValue'
            }]);
            PublicReportingAPI.setDescription('Spec2 description');

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
        PublicReportingAPI.setDescription('Title one description');

        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('AngularJS');
    });

    it('should have the correct title', function() {
        PublicReportingAPI.addAttributes([{
            key: 'titleKey3',
            value: 'titleValue3'
        }]);
        PublicReportingAPI.setDescription('Title two description');

        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('notAngular');
    });

    xit('should have the correct title, skipped', function() {
        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('notAngular');
    });
});

