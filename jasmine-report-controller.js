'use strict';

var _ = require('lodash');
var uuid = require('node-uuid');
var fs = require('fs');
var mkdirp = require('mkdir');

class JasmineReportController{

    constructor(){
        this.stack = [];
        this.flatReport = new Map([]);
    }

    get(jasmineId){
        return this.flatReport.get(jasmineId);
    }

    put(jasmineId, reportItem){
        this.flatReport.set(jasmineId, reportItem);
    }

    getClosureSuite(){
        return this.get(_.last(this.stack));
    }

    registerSuiteStarted(jasmineId){
        var item = {};
        if(!this.isSuiteStackEmpty()){
            var closure = this.getClosureSuite();
            item._parent = closure.id;
        }
        this.stack.push(jasmineId);
        item.id = jasmineId;
        item.type = 'SUITE';
        item.state = 'started';
        item.level = this.getSuiteLevel();
        this.put(jasmineId, item);
    }

    registerTestStarted(jasmineId){
        var item = {};
        if(!this.isSuiteStackEmpty()){
            var closure = this.getClosureSuite();
            item._parent = closure.id;
        }
        item.id = jasmineId;
        item.type = 'TEST';
        item.state = 'started';
        item.level = this.getTestLevel();
        this.put(jasmineId, item);
    }

    getParent(jasmineId){
        var parentId = this.get(jasmineId)._parent;
        return parentId !== undefined ? this.get(parentId) : undefined;
    }

    registerSuiteFinished(jasmineId){
        if(this.isCurrentSuiteStack(jasmineId)){
            this.popSuiteStack();
            this.update(jasmineId, {state: "done"});
        }
    }

    registerTestFinished(jasmineId){
        this.update(jasmineId, {state: "done"});
    }

    update(jasmineId, update){
        this.put(jasmineId, Object.assign(this.get(jasmineId), update));
    }

    isCurrentSuiteStack(jasmineId){
        return jasmineId === _.last(this.stack);
    }

    popSuiteStack(){
        this.stack.pop();
    }

    isSuiteStackEmpty(){
        return this.stack.length === 0;
    }

    collect(){
        var result = this.getFlatReport();
        if(this.isSuiteStackEmpty()){
            this.flatReport.clear();
        }
        return result;
    }

    getFlatReport(){
        var result = [];
        this.flatReport.forEach(function(item, key){
            result.push(item);
        });
        return result;
    }

    getChilds(result, rootRef){
        return _.filter(result, function (item) {
            return ('undefined' !== typeof item._parent) && item._parent === rootRef;
        });
    }
    
    totalFinishes(){
        return _.map(this.getFlatReport(), function(item){
            return item.finished;
        });
    }

    allDone(jasmineId){
        var result = this.getFlatReport();
        var childs = this.getChilds(result, jasmineId);
        return _.map(childs, function(item){
            return item.finished;
        });
    }

    hasChilds(jasmineId){
        return this.getChilds(this.getFlatReport(), jasmineId).length > 0;
    }

    collectTree() {
        var result = this.collect();
        _.each(result, function (item) {
            if ('SUITE' === item.type) {
                var childs = this.getChilds(result, item.id);
                item.nested = _.filter(childs, function (child) {
                    return 'SUITE' === child.type;
                });
                item.tests = _.filter(childs, function (child) {
                    return 'TEST' === child.type;
                });
            }
        });
        return _.first(result);
    }

    getSuiteLevel(){
        return this.stack.length;
    }

    getTestLevel(){
        return this.stack.length + 1;
    }

    takeScreenshot(jasmineSpec){
        var screenShotName = jasmineSpec.id + " " + jasmineSpec.fullName + ".png";
        var dest = "target/screenshots"
        var path = dest + "/" + screenShotName;
        this.update(jasmineSpec.id, {screenshot_src: path});
        mkdirp(dest);
        browser.takeScreenshot().then(function (png) {
            var stream = fs.createWriteStream(path);
            stream.write(new Buffer(png, 'base64'));
            stream.end();
        });

    }

}

module.exports = JasmineReportController;