/* global resource, defer, http, exports, singularize, withCredentials */
var crudify = (function () {

    var $baseUrl = "!!baseUrl";
    var $methods = {};

    var capitalize = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    var trimSlashes = function (str) {
        return str.replace(/^\/?(.*?)\/?$/, '$1');
    };

    var singularizeCapitalize = function(str) {
        str = singularize(str) || str;
        str = capitalize(str);
        return str;
    };

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

    return function (target, options) {

        var methods = options.methods;
        if (!methods) {
            methods = 'all create get update delete exists count';
        }

        if(typeof methods === 'string') {
            methods = methods.split(' ');
        }
        console.log('methods', options.name, methods);

        var name = options.name;
        var i;
        var methodName;
        if (name) { // if resource was defined
            // remove extra slashes
            name = trimSlashes(name);
            // format url
            var baseUrl = trimSlashes(options.baseUrl || '') + '/';
            var url = baseUrl + trimSlashes(options.url || '') || name;
            // loop through methods and set them up
            for (i = 0; i < methods.length; i++) {
                methodName = methods[i];
                if ($methods.hasOwnProperty(methodName)) {
                    if (options.syntax === 'camel') {
                        switch (methodName) {
                            case 'all':     // getResources
                                if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](url);
                                } else {
                                    target['get' + capitalize(name)] = $methods[methodName](url);
                                }
                                break;
                            case 'create':  // createResource
                            case 'update':  // updateResource
                            case 'get':     // getResource
                            case 'delete':  // deleteResource
                                if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](url);
                                } else {
                                    target[methodName + singularizeCapitalize(name)] = $methods[methodName](url);
                                }
                                break;
                            case 'count':   // getResourceCount
                                if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target['get' + singularizeCapitalize(name) + 'Count'] = $methods.get(url);
                                }
                                break;
                            case 'exists':  // getResourceExists
                                if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                    target[options.methods[methodName].name] = $methods[methodName](name);
                                } else {
                                    target['get' + singularizeCapitalize(name) + 'Exists'] = $methods.get(url);
                                }
                                break;
                            default:
                                target[methodName + capitalize(name)] = $methods[methodName](url);
                        }
                    } else {
                        target[name] = target[name] || {};
                        target[name][methodName] = $methods[methodName](url);
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
