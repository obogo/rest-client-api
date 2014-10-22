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
                exports.fire(name + '::all', response);
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
                exports.fire(name + '::create', response);
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
                exports.fire(name + '::get', response);
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
                exports.fire(name + '::update', response);
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
                exports.fire(name + '::delete', response);
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
                exports.fire(name + '::count', response);
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
                exports.fire(name + '::count', response);
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
                    if (options.syntax === 'camel') {
                        switch (methodName) {
                            case 'all':     // getResources
                                if(options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target['get' + capitalize(name)] = $methods[methodName](name);
                                }
                                break;
                            case 'create':  // createResource
                            case 'update':  // updateResource
                            case 'get':     // getResource
                            case 'delete':  // deleteResource
                                if(options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target[methodName + capitalize(singularize(name))] = $methods[methodName](name);
                                }
                                break;
                            case 'count':   // getResourceCount
                                if(options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target['get' + capitalize(singularize(name)) + 'Count'] = $methods.get(name);
                                }
                                break;
                            case 'exists':  // getResourceExists
                                if(options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target['get' + capitalize(singularize(name)) + 'Exists'] = $methods.get(name);
                                }
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
//            for (i = 0; i < methods.length; i++) {
            for (var methodName in methods) {
                if (methods.hasOwnProperty(methodName)) {
                    method = methods[methodName];
                    switch (method.type.toUpperCase()) {
                        case 'POST':
                            exports[methodName] = $methods.create(methodName);
                            break;
                        case 'GET':
                            exports[methodName] = $methods.all(methodName);
                            break;
                        case 'PUT':
                            exports[methodName] = $methods.update(methodName);
                            break;
                        case 'DELETE':
                            exports[methodName] = $methods.delete(methodName);
                            break;
                    }
                }
            }
        }

    };

})();
