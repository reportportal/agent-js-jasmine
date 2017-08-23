describe("jasmine Report Portal reporter", function() {
    const Reporter = require("../lib/jasmine-reportportal-reporter");
    let reporter;
    let tempLaunchId = 'ewrf35432r';
    beforeEach(function() {
        let client = {
            startTestItem() {},
            finishTestItem() {},
        };
        reporter = new Reporter({
            client: client,
            tempLaunchId: tempLaunchId,
        });
    });
    it("must be properly initialized", function() {
        expect(reporter.parentIds.length).toBe(0);
    });
    it("should be escape markdown", function() {
        let escapeString = reporter.escapeMarkdown('_test*');
        expect(escapeString).toBe('\\_test\\*');
    });
    describe("suiteStarted", function() {
        it("must send a request to the agent", function() {
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452'
            });
            reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });
            expect(reporter.client.startTestItem).toHaveBeenCalledWith({
                type: 'SUITE',
                description: 'test description',
                name: 'test name'
            }, tempLaunchId, null);
        });
        it("must create an element in parentIds", function() {
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId: '3452'
            });
            reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });
            expect(reporter.parentIds.length).toBe(1);
        });
    });
    describe("suiteDone", function() {
        it("must send a request to the agent", function() {
            let tempId = 'ferw3452';
            spyOn(reporter.client, 'startTestItem').and.returnValue({
                tempId
            });
            spyOn(reporter.client, 'finishTestItem');
            reporter.suiteStarted({
                description: 'test description',
                fullName: 'test name'
            });
            reporter.suiteDone();
            expect(reporter.client.finishTestItem).toHaveBeenCalledWith(tempId, {});
        });
    });
});
