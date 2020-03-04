describe("Report Portal agent", function() {
    const { ReportportalAgent } = require("../lib/reportportal-agent");

    beforeEach(function() {
        agent = new ReportportalAgent({});
    });

    it("must be properly initialized", function() {
        expect(agent.tempLaunchId).toBeDefined();
        expect(agent.client).toBeDefined();
    });

    describe("getExitPromise", function() {
        it("must return promise", function() {
            expect((agent.getExitPromise()).then).toBeDefined();
        });
    });
});
