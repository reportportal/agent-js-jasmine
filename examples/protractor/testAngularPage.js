describe('angularjs homepage', function() {
    it('should have a title', function() {
        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('AngularJS');
    });
    it('should have the correct title', function() {
        browser.get('http://angularjs.org/');
        expect(browser.getTitle()).toContain('notAngular');
    });
});

