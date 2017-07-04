describe('github homepage', function() {
    it('should have a title', function() {
        browser.get('http://github.com/');
        expect(browser.getTitle()).toContain('GitHub');
    });
});

