describe("listener", function() {
  let Listener = require('../jasmine-epam-reportportal-listener');

  it('initialized without errors', function() {
    let listener = new Listener({});
    expect(listener.controller).toBeDefined();
  });
});
