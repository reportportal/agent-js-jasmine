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
  })
});
