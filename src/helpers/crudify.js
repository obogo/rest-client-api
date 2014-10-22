/* global resource, defer, http, crudify, exports, singularize */
var crudify = (function () {

    var $baseUrl = "!!baseUrl";
    var $methods = {};

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    $methods.all = function (name) {
        return function (params) {
            var url = resource({ baseUrl: $baseUrl }).resource(name).params(params).toUrl();
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
            var url = resource({ baseUrl: $baseUrl }).resource(name).params(params).toUrl();
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
            var url = resource({ baseUrl: $baseUrl }).resource(name, id).params(params).toUrl();
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
            var url = resource({ baseUrl: $baseUrl }).resource(name, id).params(params).toUrl();
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
            var url = resource({ baseUrl: $baseUrl }).resource(name, id).params(params).toUrl();
            var deferred = defer();
            http.delete(url, function (response) {
                deferred.resolve(response);
                exports.dispatch(name + '::delete', response);
            });
            return deferred.promise;
        };
    };

    $methods.count = function (name) {
        return function (params) {
            var url = resource({ baseUrl: $baseUrl }).resource(name).resource('count').params(params).toUrl();
            var deferred = defer();
            http.get(url, function (response) {
                deferred.resolve(response);
                exports.dispatch(name + '::count', response);
            });
            return deferred.promise;
        };
    };


    $methods.exists = function (name) {
        return function (params) {
            var url = resource({ baseUrl: $baseUrl }).resource(name).resource('exists').params(params).toUrl();
            var deferred = defer();
            http.get(url, function (response) {
                deferred.resolve(response);
                exports.dispatch(name + '::count', response);
            });
            return deferred.promise;
        };
    };

    return function (target, options, methods) {
        if (!methods) {
            methods = 'all create get update delete exists count';
        }
        methods = methods.split(' ');

        var name = options.name;
        var i;
        if (name) { // if resource was defined
            var methodName;
            for (i = 0; i < methods.length; i++) {
                methodName = methods[i];
                if ($methods.hasOwnProperty(methodName)) {
                    if(options.syntax === 'camel') {
                        switch(methodName) {
                            case 'all':
                                target['find' + capitalize(name)] = $methods[methodName](name);
                                break;
                            case 'create':
                            case 'update':
                            case 'get':
                            case 'delete':
                                target[methodName + capitalize(singularize(name))] = $methods[methodName](name);
                                break;
                            default:
                                target[methodName + capitalize(name)] = $methods[methodName](name);
                        }
                    } else {
                        target[name] = target[name] || {};
                        target[name][methodName] = $methods[methodName](name);
                    }
                }
            }
        } else { // otherwise we place it on the global namespace
            var method;
            methods = options.methods;
            for (i = 0; i < methods.length; i++) {
                method = methods[i];
//                console.log('####method####', methodName);
                switch(method.type.toUpperCase()) {
                    case 'POST':
                        exports[method.name] = $methods.create(method.name);
                        break;
                    case 'GET':
                        exports[method.name] = $methods.all(method.name);
                        break;
                    case 'PUT':
                        exports[method.name] = $methods.update(method.name);
                        break;
                    case 'DELETE':
                        exports[method.name] = $methods.delete(method.name);
                        break;
                }
            }
        }

    };

})();
