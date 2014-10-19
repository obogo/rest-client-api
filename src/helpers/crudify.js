/* global resource, defer, http, crudify, exports */
var crudify = (function () {
    var $methods = {};

    $methods.all = function (name) {
        return function (params) {
            var url = resource(name).params(params).toUrl();
            var deferred = defer();
            http.get(url, function (response) {
                deferred.resolve(response);
                exports.dispatch(name + '::all', response);
            });
            return deferred.promise;
        };
    };

    $methods.create = function (name) {
        return function (data, params) {
            var url = resource(name).params(params).toUrl();
            var deferred = defer();
            http.post(url, data, function (response) {
                deferred.resolve(response);
                exports.dispatch(name + '::create', response);
            });
            return deferred.promise;
        };
    };

    $methods.get = function (name) {
        return function (id, params) {
            var url = resource(name, id).params(params).toUrl();
            var deferred = defer();
            http.get(url, function (response) {
                deferred.resolve(response);
                exports.dispatch(name + '::get', response);
            });
            return deferred.promise;
        };
    };

    $methods.update = function (name) {
        return function (id, data, params) {
            var url = resource(name, id).params(params).toUrl();
            var deferred = defer();
            http.put(url, data, function (response) {
                deferred.resolve(response);
                exports.dispatch(name + '::update', response);
            });
            return deferred.promise;
        };
    };

    $methods.delete = function (name) {
        return function (id, params) {
            var url = resource(name, id).params(params).toUrl();
            var deferred = defer();
            http.delete(url, function (response) {
                deferred.resolve(response);
                exports.dispatch(name + '::delete', response);
            });
            return deferred.promise;
        };
    };

    return function (target, name, methods) {
        if (!methods) {
            methods = 'all create get update delete';
        }
        methods = methods.split(' ');

        var resource = target[name] = {};

        var methodName;
        for (var i = 0; i < methods.length; i++) {
            methodName = methods[i];
            if ($methods.hasOwnProperty(methodName)) {
                resource[methodName] = $methods[methodName](name);
            }
        }
    };
})();
