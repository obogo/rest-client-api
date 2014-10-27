/* global resource, defer, http, exports, singularize, withCredentials */
var crudify = (function () {

    var $baseUrl = "!!baseUrl";
    var $methods = {};

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    $methods.all = function (name) {
        return function (params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = !!withCredentials;
            payload.url = resource({baseUrl: $baseUrl}).resource(name).params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.get(payload);
            return deferred.promise;
        };
    };

    $methods.create = function (name) {
        return function (data, params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = !!withCredentials;
            payload.url = resource({baseUrl: $baseUrl}).resource(name).params(params).toUrl();
            payload.data = data;
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.post(payload);
            return deferred.promise;
        };
    };

    $methods.get = function (name) {
        return function (id, params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = !!withCredentials;
            payload.url = resource({baseUrl: $baseUrl}).resource(name, id).params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.get(payload);
            return deferred.promise;
        };
    };

    $methods.update = function (name) {
        return function (id, data, params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = !!withCredentials;
            payload.url = resource({baseUrl: $baseUrl}).resource(name, id).params(params).toUrl();
            payload.data = data;
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.put(payload);
            return deferred.promise;
        };
    };

    $methods.delete = function (name) {
        return function (id, params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = !!withCredentials;
            payload.url = resource({baseUrl: $baseUrl}).resource(name, id).params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.delete(payload);
            return deferred.promise;
        };
    };

    $methods.count = function (name) {
        return function (params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = !!withCredentials;
            payload.url = resource({baseUrl: $baseUrl}).resource(name).resource('count').params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.get(payload);
            return deferred.promise;
        };
    };


    $methods.exists = function (name) {
        return function (params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = !!withCredentials;
            payload.url = resource({baseUrl: $baseUrl}).resource(name).resource('exists').params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.get(payload);
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
        var methodName;
        if (name) { // if resource was defined
            name = name.replace(/^\/?(.*?)\/?$/, '$1');
            for (i = 0; i < methods.length; i++) {
                methodName = methods[i];
                if ($methods.hasOwnProperty(methodName)) {
                    if (options.syntax === 'camel') {
                        switch (methodName) {
                            case 'all':     // getResources
                                if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target['get' + capitalize(name)] = $methods[methodName](name);
                                }
                                break;
                            case 'create':  // createResource
                            case 'update':  // updateResource
                            case 'get':     // getResource
                            case 'delete':  // deleteResource
                                if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target[methodName + capitalize(singularize(name))] = $methods[methodName](name);
                                }
                                break;
                            case 'count':   // getResourceCount
                                if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target['get' + capitalize(singularize(name)) + 'Count'] = $methods.get(name);
                                }
                                break;
                            case 'exists':  // getResourceExists
                                if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target['get' + capitalize(singularize(name)) + 'Exists'] = $methods.get(name);
                                }
                                break;
                            default:
                                target[methodName + capitalize(name)] = $methods[methodName](name);
                        }
                    } else {
                        var uri = options.uri || '';
                        uri = uri.replace(/^\/?(.*?)\/?$/, '$1');// + '/';
                        target[name] = target[name] || {};
                        target[name][methodName] = $methods[methodName](uri + name);
                    }
                }
            }
        } else { // otherwise we place it on the global namespace
            var method;
            methods = options.methods;
            for (methodName in methods) {
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
