'use strict';

describe("listener", function() {
  let Listener = require('../jasmine-epam-reportportal-listener');

  it('initialized without errors', function() {
    let listener = new Listener({});
    expect(listener.controller).toBeDefined();
  });

  describe("jasmineStarted", function() {
    beforeAll(function() {
      //  define browser if not yet, as used in listener.jasmineStarted
      global["browser"] = global["browser"] || {getCapabilities: function(){return new Promise(function(){})}};
    })
    it("does not throw exceptions", function() {
      let listener = new Listener({launch: "l1"});
      listener.jasmineStarted({totalSpecsDefined: 42});
      expect(listener.totalSpecsToDo).toBe(42);
    });
  });
});
