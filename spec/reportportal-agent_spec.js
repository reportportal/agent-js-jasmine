describe("Report Portal agent", function() {
    const Agent = require("../lib/reportportal-agent");
    beforeEach(function() {
        agent = new Agent({});
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
