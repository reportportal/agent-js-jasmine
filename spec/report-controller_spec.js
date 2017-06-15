describe("report-controller", function() {
  var ReportController = require("../jasmine-report-controller");
  var reportController = null;
  beforeEach(function() {
    reportController = new ReportController();
  })
  it("initializes", function() {
    expect(reportController.getSuiteLevel()).toBe(0);
  });
  it("gets what was put", function() {
    reportController.put("ID01", "reportItem01");
    expect(reportController.get("ID01")).toBe("reportItem01");
  });
  describe("registerSuiteStarted", function() {
    it("add jasmineId to stack", function() {
      spyOn(reportController.stack, 'push').and.callThrough();
      reportController.registerSuiteStarted("jsID42");
      expect(reportController.stack.push).toHaveBeenCalledWith("jsID42");
    });
    it("set parent property if suite was started already", function() {
      reportController.registerSuiteStarted("first");
      reportController.registerSuiteStarted("second");
      expect(reportController.flatReport.get("second")._parent).toBe("first");
    });
  });
  describe("registerTestStarted", function() {
    it("puts new test item", function() {
      reportController.registerTestStarted("testID");
      expect(reportController.flatReport.has("testID"));
    });
  });
});
