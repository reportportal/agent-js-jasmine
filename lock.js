var q = require('q');

var deferred = q.defer();

var p = deferred.promise;

exports.getPromise = function(){
    return p;
}

exports.resolve = function () {
    console.log("Resolve deferred");
    deferred.resolve.apply(deferred, arguments);
};

exports.teardown = function () {
    console.log("TEAR DOWN TEST RUN");
    return p;
};