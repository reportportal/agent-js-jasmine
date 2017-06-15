'use strict';

describe("listener", function() {
  let Listener = require('../jasmine-epam-reportportal-listener');
  let listener;

  beforeEach(function() {
    listener = new Listener({launch: "l2"});
  });

  it('initialized without errors', function() {
    expect(listener.controller).toBeDefined();
  });

  describe("jasmineStarted", function() {
    beforeAll(function() {
      //  define browser if not yet, as used in listener.jasmineStarted
      global["browser"] = global["browser"] || {
        getCapabilities: () => new Promise(()=>{}),
        takeScreenshot: () => new Promise(()=>{})
      };
    })
    it("does not throw exceptions", function() {
      listener.jasmineStarted({totalSpecsDefined: 42});
      expect(listener.totalSpecsToDo).toBe(42);
    });
  });
  describe("suiteStarted", function() {
    it("updates controller", function() {
      
      spyOn(listener.controller, 'update');
      spyOn(listener.controller, 'registerSuiteStarted');
      let suite = {description: "desc"};
      listener.jasmineStarted({});

      listener.suiteStarted(suite);

      expect(listener.controller.registerSuiteStarted).toHaveBeenCalled();
      expect(listener.controller.update).toHaveBeenCalled();
    })
  });
  describe("suiteDone", function() {
    it("register suite finished", function() {
      spyOn(listener.controller, "registerSuiteFinished");

      listener.suiteDone({id: "done-suite-42"});

      expect(listener.controller.registerSuiteFinished).toHaveBeenCalledWith("done-suite-42");
    });
  });
  describe("specStarted", function() {
    it("updates controller", function() {
      listener.jasmineStarted({});
      spyOn(listener.controller, 'update');

      listener.specStarted({id: "specID"})

      expect(listener.controller.update).toHaveBeenCalledWith("specID", jasmine.anything());
    });
  });
  describe("specDone", function() {
    it("registers test finished", function() {
      spyOn(listener.controller, 'registerTestFinished');
      spyOn(listener.controller, 'get').and.returnValue({_self: new Promise(()=>{})});

      listener.specDone({id: "doneSpec"});

      expect(listener.controller.registerTestFinished).toHaveBeenCalledWith("doneSpec");
    });
  });
});
