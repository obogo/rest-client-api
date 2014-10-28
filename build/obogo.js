/*
* obogo v.1.0.0
*/
(function() {
var exports = {};
var crudify = function() {
    var $baseUrl = "http://localhost:3000/v1";
    var $methods = {};
    var capitalize = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    var trimSlashes = function(str) {
        return str.replace(/^\/?(.*?)\/?$/, "$1");
    };
    var singularizeCapitalize = function(str) {
        str = singularize(str) || str;
        str = capitalize(str);
        return str;
    };
    $methods.all = function(name) {
        return function(params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = true;
            payload.url = resource({
                baseUrl: $baseUrl
            }).resource(name).params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.get(payload);
            return deferred.promise;
        };
    };
    $methods.create = function(name) {
        return function(data, params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = true;
            payload.url = resource({
                baseUrl: $baseUrl
            }).resource(name).params(params).toUrl();
            payload.data = data;
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.post(payload);
            return deferred.promise;
        };
    };
    $methods.get = function(name) {
        return function(id, params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = true;
            payload.url = resource({
                baseUrl: $baseUrl
            }).resource(name, id).params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.get(payload);
            return deferred.promise;
        };
    };
    $methods.update = function(name) {
        return function(id, data, params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = true;
            payload.url = resource({
                baseUrl: $baseUrl
            }).resource(name, id).params(params).toUrl();
            payload.data = data;
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.put(payload);
            return deferred.promise;
        };
    };
    $methods.delete = function(name) {
        return function(id, params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = true;
            payload.url = resource({
                baseUrl: $baseUrl
            }).resource(name, id).params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.delete(payload);
            return deferred.promise;
        };
    };
    $methods.count = function(name) {
        return function(params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = true;
            payload.url = resource({
                baseUrl: $baseUrl
            }).resource(name).resource("count").params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.get(payload);
            return deferred.promise;
        };
    };
    $methods.exists = function(name) {
        return function(params) {
            var deferred = defer();
            var payload = {};
            payload.credentials = true;
            payload.url = resource({
                baseUrl: $baseUrl
            }).resource(name).resource("exists").params(params).toUrl();
            payload.success = deferred.resolve;
            payload.error = deferred.reject;
            http.get(payload);
            return deferred.promise;
        };
    };
    return function(target, options) {
        var methods = options.methods;
        if (!methods) {
            methods = "all create get update delete exists count";
        }
        if (typeof methods === "string") {
            methods = methods.split(" ");
        }
        console.log("methods", options.name, methods);
        var name = options.name;
        var i;
        var methodName;
        if (name) {
            name = trimSlashes(name);
            var baseUrl = trimSlashes(options.baseUrl || "") + "/";
            var url = baseUrl + trimSlashes(options.url || "") || name;
            for (i = 0; i < methods.length; i++) {
                methodName = methods[i];
                if ($methods.hasOwnProperty(methodName)) {
                    if (options.syntax === "camel") {
                        switch (methodName) {
                          case "all":
                            if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                target[options.methods[methodName].name] = $methods[methodName](url);
                            } else {
                                target["get" + capitalize(name)] = $methods[methodName](url);
                            }
                            break;

                          case "create":
                          case "update":
                          case "get":
                          case "delete":
                            if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                target[options.methods[methodName].name] = $methods[methodName](url);
                            } else {
                                target[methodName + singularizeCapitalize(name)] = $methods[methodName](url);
                            }
                            break;

                          case "count":
                            if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                target[options.methods[methodName].name] = $methods[methodName](name);
                            } else {
                                target["get" + singularizeCapitalize(name) + "Count"] = $methods.get(url);
                            }
                            break;

                          case "exists":
                            if (options.methods && options.methods.hasOwnProperty(methodName)) {
                                target[options.methods[methodName].name] = $methods[methodName](name);
                            } else {
                                target["get" + singularizeCapitalize(name) + "Exists"] = $methods.get(url);
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
        } else {
            var method;
            methods = options.methods;
            for (methodName in methods) {
                if (methods.hasOwnProperty(methodName)) {
                    method = methods[methodName];
                    switch (method.type.toUpperCase()) {
                      case "POST":
                        exports[methodName] = $methods.create(methodName);
                        break;

                      case "GET":
                        exports[methodName] = $methods.all(methodName);
                        break;

                      case "PUT":
                        exports[methodName] = $methods.update(methodName);
                        break;

                      case "DELETE":
                        exports[methodName] = $methods.delete(methodName);
                        break;
                    }
                }
            }
        }
    };
}();

var defer = function(undef) {
    var nextTick, isFunc = function(f) {
        return typeof f === "function";
    }, isArray = function(a) {
        return Array.isArray ? Array.isArray(a) : a instanceof Array;
    }, isObjOrFunc = function(o) {
        return !!(o && (typeof o).match(/function|object/));
    }, isNotVal = function(v) {
        return v === false || v === undef || v === null;
    }, slice = function(a, offset) {
        return [].slice.call(a, offset);
    }, undefStr = "undefined", tErr = typeof TypeError === undefStr ? Error : TypeError;
    if (typeof process !== undefStr && process.nextTick) {
        nextTick = process.nextTick;
    } else if (typeof MessageChannel !== undefStr) {
        var ntickChannel = new MessageChannel(), queue = [];
        ntickChannel.port1.onmessage = function() {
            queue.length && queue.shift()();
        };
        nextTick = function(cb) {
            queue.push(cb);
            ntickChannel.port2.postMessage(0);
        };
    } else {
        nextTick = function(cb) {
            setTimeout(cb, 0);
        };
    }
    function rethrow(e) {
        nextTick(function() {
            throw e;
        });
    }
    function promise_success(fulfilled) {
        return this.then(fulfilled, undef);
    }
    function promise_error(failed) {
        return this.then(undef, failed);
    }
    function promise_apply(fulfilled, failed) {
        return this.then(function(a) {
            return isFunc(fulfilled) ? fulfilled.apply(null, isArray(a) ? a : [ a ]) : defer.onlyFuncs ? a : fulfilled;
        }, failed || undef);
    }
    function promise_ensure(cb) {
        function _cb() {
            cb();
        }
        this.then(_cb, _cb);
        return this;
    }
    function promise_nodify(cb) {
        return this.then(function(a) {
            return isFunc(cb) ? cb.apply(null, isArray(a) ? a.splice(0, 0, undefined) && a : [ undefined, a ]) : defer.onlyFuncs ? a : cb;
        }, function(e) {
            return cb(e);
        });
    }
    function promise_rethrow(failed) {
        return this.then(undef, failed ? function(e) {
            failed(e);
            throw e;
        } : rethrow);
    }
    var defer = function(alwaysAsync) {
        var alwaysAsyncFn = (undef !== alwaysAsync ? alwaysAsync : defer.alwaysAsync) ? nextTick : function(fn) {
            fn();
        }, status = 0, pendings = [], value, _promise = {
            then: function(fulfilled, failed) {
                var d = defer();
                pendings.push([ function(value) {
                    try {
                        if (isNotVal(fulfilled)) {
                            d.resolve(value);
                        } else {
                            d.resolve(isFunc(fulfilled) ? fulfilled(value) : defer.onlyFuncs ? value : fulfilled);
                        }
                    } catch (e) {
                        d.reject(e);
                    }
                }, function(err) {
                    if (isNotVal(failed) || !isFunc(failed) && defer.onlyFuncs) {
                        d.reject(err);
                    }
                    if (failed) {
                        try {
                            d.resolve(isFunc(failed) ? failed(err) : failed);
                        } catch (e) {
                            d.reject(e);
                        }
                    }
                } ]);
                status !== 0 && alwaysAsyncFn(execCallbacks);
                return d.promise;
            },
            success: promise_success,
            error: promise_error,
            otherwise: promise_error,
            apply: promise_apply,
            spread: promise_apply,
            ensure: promise_ensure,
            nodify: promise_nodify,
            rethrow: promise_rethrow,
            isPending: function() {
                return !!(status === 0);
            },
            getStatus: function() {
                return status;
            }
        };
        _promise.toSource = _promise.toString = _promise.valueOf = function() {
            return value === undef ? this : value;
        };
        function execCallbacks() {
            if (status === 0) {
                return;
            }
            var cbs = pendings, i = 0, l = cbs.length, cbIndex = ~status ? 0 : 1, cb;
            pendings = [];
            for (;i < l; i++) {
                (cb = cbs[i][cbIndex]) && cb(value);
            }
        }
        function _resolve(val) {
            var done = false;
            function once(f) {
                return function(x) {
                    if (done) {
                        return undefined;
                    } else {
                        done = true;
                        return f(x);
                    }
                };
            }
            if (status) {
                return this;
            }
            try {
                var then = isObjOrFunc(val) && val.then;
                if (isFunc(then)) {
                    if (val === _promise) {
                        throw new tErr("Promise can't resolve itself");
                    }
                    then.call(val, once(_resolve), once(_reject));
                    return this;
                }
            } catch (e) {
                once(_reject)(e);
                return this;
            }
            alwaysAsyncFn(function() {
                value = val;
                status = 1;
                execCallbacks();
            });
            return this;
        }
        function _reject(Err) {
            status || alwaysAsyncFn(function() {
                try {
                    throw Err;
                } catch (e) {
                    value = e;
                }
                status = -1;
                execCallbacks();
            });
            return this;
        }
        return {
            promise: _promise,
            resolve: _resolve,
            fulfill: _resolve,
            reject: _reject
        };
    };
    defer.deferred = defer.defer = defer;
    defer.nextTick = nextTick;
    defer.alwaysAsync = true;
    defer.onlyFuncs = true;
    defer.resolved = defer.fulfilled = function(value) {
        return defer(true).resolve(value).promise;
    };
    defer.rejected = function(reason) {
        return defer(true).reject(reason).promise;
    };
    defer.wait = function(time) {
        var d = defer();
        setTimeout(d.resolve, time || 0);
        return d.promise;
    };
    defer.delay = function(fn, delay) {
        var d = defer();
        setTimeout(function() {
            try {
                d.resolve(fn.apply(null));
            } catch (e) {
                d.reject(e);
            }
        }, delay || 0);
        return d.promise;
    };
    defer.promisify = function(promise) {
        if (promise && isFunc(promise.then)) {
            return promise;
        }
        return defer.resolved(promise);
    };
    function multiPromiseResolver(callerArguments, returnPromises) {
        var promises = slice(callerArguments);
        if (promises.length === 1 && isArray(promises[0])) {
            if (!promises[0].length) {
                return defer.fulfilled([]);
            }
            promises = promises[0];
        }
        var args = [], d = defer(), c = promises.length;
        if (!c) {
            d.resolve(args);
        } else {
            var resolver = function(i) {
                promises[i] = defer.promisify(promises[i]);
                promises[i].then(function(v) {
                    if (!(i in args)) {
                        args[i] = returnPromises ? promises[i] : v;
                        --c || d.resolve(args);
                    }
                }, function(e) {
                    if (!(i in args)) {
                        if (!returnPromises) {
                            d.reject(e);
                        } else {
                            args[i] = promises[i];
                            --c || d.resolve(args);
                        }
                    }
                });
            };
            for (var i = 0, l = c; i < l; i++) {
                resolver(i);
            }
        }
        return d.promise;
    }
    defer.all = function() {
        return multiPromiseResolver(arguments, false);
    };
    defer.resolveAll = function() {
        return multiPromiseResolver(arguments, true);
    };
    defer.nodeCapsule = function(subject, fn) {
        if (!fn) {
            fn = subject;
            subject = void 0;
        }
        return function() {
            var d = defer(), args = slice(arguments);
            args.push(function(err, res) {
                err ? d.reject(err) : d.resolve(arguments.length > 2 ? slice(arguments, 1) : res);
            });
            try {
                fn.apply(subject, args);
            } catch (e) {
                d.reject(e);
            }
            return d.promise;
        };
    };
    return defer;
}();

var dispatcher = function(target, scope, map) {
    var listeners = {};
    function off(event, callback) {
        var index, list;
        list = listeners[event];
        if (list) {
            if (callback) {
                index = list.indexOf(callback);
                if (index !== -1) {
                    list.splice(index, 1);
                }
            } else {
                list.length = 0;
            }
        }
    }
    function on(event, callback) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(callback);
        return function() {
            off(event, callback);
        };
    }
    function once(event, callback) {
        function fn() {
            off(event, fn);
            callback.apply(scope || target, arguments);
        }
        return on(event, fn);
    }
    function getListeners(event) {
        return listeners[event];
    }
    function fire(callback, args) {
        return callback && callback.apply(target, args);
    }
    function dispatch(event) {
        if (listeners[event]) {
            var i = 0, list = listeners[event], len = list.length;
            while (i < len) {
                fire(list[i], arguments);
                i += 1;
            }
        }
    }
    if (scope && map) {
        target.on = scope[map.on] && scope[map.on].bind(scope);
        target.off = scope[map.off] && scope[map.off].bind(scope);
        target.once = scope[map.once] && scope[map.once].bind(scope);
        target.fire = scope[map.dispatch].bind(scope);
    } else {
        target.on = on;
        target.off = off;
        target.once = once;
        target.fire = dispatch;
    }
};

var http = function() {
    var serialize = function(obj) {
        var str = [];
        for (var p in obj) if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
        return str.join("&");
    };
    var win = window, CORSxhr = function() {
        var xhr;
        if (win.XMLHttpRequest && "withCredentials" in new win.XMLHttpRequest()) {
            xhr = win.XMLHttpRequest;
        } else if (win.XDomainRequest) {
            xhr = win.XDomainRequest;
        }
        return xhr;
    }(), methods = [ "head", "get", "post", "put", "delete" ], i = 0, methodsLength = methods.length, result = {};
    function Request(options) {
        this.init(options);
    }
    Request.prototype.init = function(options) {
        var that = this;
        that.xhr = new CORSxhr();
        that.method = options.method;
        that.url = options.url;
        that.success = options.success;
        that.error = options.error;
        that.data = options.data;
        that.headers = options.headers;
        if (options.credentials === true) {
            that.xhr.withCredentials = true;
        }
        that.send();
        return that;
    };
    Request.prototype.send = function() {
        var that = this;
        if (that.method === "GET" && that.data) {
            var concat = that.url.indexOf("?") > -1 ? "&" : "?";
            that.url += concat + serialize(that.data);
        } else {
            that.data = JSON.stringify(that.data);
        }
        if (that.success !== undefined) {
            that.xhr.onload = function() {
                var headers = parseResponseHeaders(this.getAllResponseHeaders());
                var response = this.responseText;
                if (headers.contentType && headers.contentType.indexOf("application/json") !== -1) {
                    response = JSON.parse(response);
                }
                that.success.call(this, {
                    data: response,
                    request: {
                        method: that.method,
                        url: that.url,
                        data: that.data,
                        headers: that.headers
                    },
                    headers: headers,
                    status: this.status
                });
            };
        }
        if (that.error !== undefined) {
            that.xhr.error = function() {
                that.error.call(this, this.responseText);
            };
        }
        that.xhr.open(that.method, that.url, true);
        if (that.headers !== undefined) {
            that.setHeaders();
        }
        that.xhr.send(that.data, true);
        return that;
    };
    Request.prototype.setHeaders = function() {
        var that = this, headers = that.headers, key;
        for (key in headers) {
            if (headers.hasOwnProperty(key)) {
                that.xhr.setRequestHeader(key, headers[key]);
            }
        }
        return that;
    };
    function parseResponseHeaders(str) {
        var list = str.split("\n");
        var headers = {};
        var parts;
        var i = 0, len = list.length;
        while (i < len) {
            parts = list[i].split(": ");
            if (parts[0] && parts[1]) {
                parts[0] = parts[0].split("-").join("").split("");
                parts[0][0] = parts[0][0].toLowerCase();
                headers[parts[0].join("")] = parts[1];
            }
            i += 1;
        }
        return headers;
    }
    function addDefaults(options, defaults) {
        for (var i in defaults) {
            if (defaults.hasOwnProperty(i) && options[i] === undefined) {
                if (typeof defaults[i] === "object") {
                    options[i] = {};
                    addDefaults(options[i], defaults[i]);
                } else {
                    options[i] = defaults[i];
                }
            }
        }
        return options;
    }
    for (i; i < methodsLength; i += 1) {
        (function() {
            var method = methods[i];
            result[method] = function(url, success) {
                var options = {};
                if (url === undefined) {
                    throw new Error("CORS: url must be defined");
                }
                if (typeof url === "object") {
                    options = url;
                } else {
                    if (typeof success === "function") {
                        options.success = success;
                    }
                    options.url = url;
                }
                options.method = method.toUpperCase();
                addDefaults(options, result.defaults);
                return new Request(options).xhr;
            };
        })();
    }
    result.defaults = {
        headers: {}
    };
    return result;
}();

var inflections = {
    plurals: [],
    singulars: [],
    uncountables: [],
    humans: []
};

var PLURALS = inflections.plurals, SINGULARS = inflections.singulars, UNCOUNTABLES = inflections.uncountables, HUMANS = inflections.humans;

var plural = function(rule, replacement) {
    inflections.plurals.unshift([ rule, replacement ]);
};

var singular = function(rule, replacement) {
    inflections.singulars.unshift([ rule, replacement ]);
};

var uncountable = function(word) {
    inflections.uncountables.unshift(word);
};

var irregular = function(s, p) {
    if (s.substr(0, 1).toUpperCase() === p.substr(0, 1).toUpperCase()) {
        plural(new RegExp("(" + s.substr(0, 1) + ")" + s.substr(1) + "$", "i"), "$1" + p.substr(1));
        plural(new RegExp("(" + p.substr(0, 1) + ")" + p.substr(1) + "$", "i"), "$1" + p.substr(1));
        singular(new RegExp("(" + p.substr(0, 1) + ")" + p.substr(1) + "$", "i"), "$1" + s.substr(1));
    } else {
        plural(new RegExp(s.substr(0, 1).toUpperCase() + s.substr(1) + "$"), p.substr(0, 1).toUpperCase() + p.substr(1));
        plural(new RegExp(s.substr(0, 1).toLowerCase() + s.substr(1) + "$"), p.substr(0, 1).toLowerCase() + p.substr(1));
        plural(new RegExp(p.substr(0, 1).toUpperCase() + p.substr(1) + "$"), p.substr(0, 1).toUpperCase() + p.substr(1));
        plural(new RegExp(p.substr(0, 1).toLowerCase() + p.substr(1) + "$"), p.substr(0, 1).toLowerCase() + p.substr(1));
        singular(new RegExp(p.substr(0, 1).toUpperCase() + p.substr(1) + "$"), s.substr(0, 1).toUpperCase() + s.substr(1));
        singular(new RegExp(p.substr(0, 1).toLowerCase() + p.substr(1) + "$"), s.substr(0, 1).toLowerCase() + s.substr(1));
    }
};

var human = function(rule, replacement) {
    inflections.humans.push([ rule, replacement ]);
};

plural(/$/, "s");

plural(/s$/i, "s");

plural(/(ax|test)is$/i, "$1es");

plural(/(octop|vir)us$/i, "$1i");

plural(/(alias|status)$/i, "$1es");

plural(/(bu)s$/i, "$1ses");

plural(/(buffal|tomat)o$/i, "$1oes");

plural(/([ti])um$/i, "$1a");

plural(/sis$/i, "ses");

plural(/(?:([^f])fe|([lr])f)$/i, "$1$2ves");

plural(/(hive)$/i, "$1s");

plural(/([^aeiouy]|qu)y$/i, "$1ies");

plural(/(x|ch|ss|sh)$/i, "$1es");

plural(/(matr|vert|ind)(?:ix|ex)$/i, "$1ices");

plural(/([m|l])ouse$/i, "$1ice");

plural(/^(ox)$/i, "$1en");

plural(/(quiz)$/i, "$1zes");

singular(/s$/i, "");

singular(/(n)ews$/i, "$1ews");

singular(/([ti])a$/i, "$1um");

singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, "$1$2sis");

singular(/(^analy)ses$/i, "$1sis");

singular(/([^f])ves$/i, "$1fe");

singular(/(hive)s$/i, "$1");

singular(/(tive)s$/i, "$1");

singular(/([lr])ves$/i, "$1f");

singular(/([^aeiouy]|qu)ies$/i, "$1y");

singular(/(s)eries$/i, "$1eries");

singular(/(m)ovies$/i, "$1ovie");

singular(/(x|ch|ss|sh)es$/i, "$1");

singular(/([m|l])ice$/i, "$1ouse");

singular(/(bus)es$/i, "$1");

singular(/(o)es$/i, "$1");

singular(/(shoe)s$/i, "$1");

singular(/(cris|ax|test)es$/i, "$1is");

singular(/(octop|vir)i$/i, "$1us");

singular(/(alias|status)es$/i, "$1");

singular(/^(ox)en/i, "$1");

singular(/(vert|ind)ices$/i, "$1ex");

singular(/(matr)ices$/i, "$1ix");

singular(/(quiz)zes$/i, "$1");

singular(/(database)s$/i, "$1");

irregular("person", "people");

irregular("man", "men");

irregular("child", "children");

irregular("sex", "sexes");

irregular("move", "moves");

irregular("cow", "kine");

uncountable("equipment");

uncountable("information");

uncountable("rice");

uncountable("money");

uncountable("species");

uncountable("series");

uncountable("fish");

uncountable("sheep");

uncountable("jeans");

var pluralize = function(word) {
    var wlc = word.toLowerCase();
    var i;
    for (i = 0; i < UNCOUNTABLES.length; i++) {
        var uncountable = UNCOUNTABLES[i];
        if (wlc === uncountable) {
            return word;
        }
    }
    for (i = 0; i < PLURALS.length; i++) {
        var rule = PLURALS[i][0], replacement = PLURALS[i][1];
        if (rule.test(word)) {
            return word.replace(rule, replacement);
        }
    }
};

var singularize = function(word) {
    var wlc = word.toLowerCase();
    var i;
    for (i = 0; i < UNCOUNTABLES.length; i++) {
        var uncountable = UNCOUNTABLES[i];
        if (wlc === uncountable) {
            return word;
        }
    }
    for (i = 0; i < SINGULARS.length; i++) {
        var rule = SINGULARS[i][0], replacement = SINGULARS[i][1];
        if (rule.test(word)) {
            return word.replace(rule, replacement);
        }
    }
};

var humanize = function(word) {
    for (var i = 0; i < HUMANS.length; i++) {
        var rule = HUMANS[i][0], replacement = HUMANS[i][1];
        if (rule.test(word)) {
            word = word.replace(rule, replacement);
        }
    }
    return camelToTerms(word, " ").toLowerCase();
};

var camelToTerms = function(word, delim) {
    delim = delim || " ";
    var replacement = "$1" + delim + "$2";
    return word.replace(/([A-Z]+)([A-Z][a-z])/g, replacement).replace(/([a-z\d])([A-Z])/g, replacement);
};

var underscore = function(word) {
    return camelToTerms(word, "_").toLowerCase();
};

var dasherize = function(word) {
    return camelToTerms(word, "-").toLowerCase();
};

exports.inflection = {
    pluralize: pluralize,
    singularize: singularize,
    humanize: humanize,
    camelToTerms: camelToTerms,
    underscore: underscore,
    dasherize: dasherize
};

Array.prototype.isArray = true;

Object.defineProperty(Array.prototype, "isArray", {
    enumerable: false,
    writable: false
});

var resource = function() {
    function clone(hash) {
        return JSON.parse(JSON.stringify(hash));
    }
    function parseUrl(url, hash) {
        for (var e in hash) {
            var regExp = new RegExp(":(" + e + ")\\b", "g");
            if (regExp.test(url)) {
                url = url.replace(regExp, hash[e]);
                delete hash[e];
            }
        }
        return url;
    }
    function hashToSearch(hash) {
        var search = hash ? "?" : "";
        for (var k in hash) {
            if (hash[k].isArray) {
                for (var i = 0; i < hash[k].length; i++) {
                    search += search === "?" ? "" : "&";
                    search += encodeURIComponent(k) + "=" + encodeURIComponent(hash[k][i]);
                }
            } else {
                search += search === "?" ? "" : "&";
                search += encodeURIComponent(k) + "=" + encodeURIComponent(hash[k]);
            }
        }
        return search;
    }
    function Resource(name, id) {
        this.$$id = id;
        if (typeof name === "string") {
            this.$$name = name.replace(/^\/?(.*?)\/?$/, "$1");
        }
        this.$$parent = null;
        this.$$params = null;
    }
    Resource.prototype.id = function(id) {
        if (id === undefined) {
            return this.$$id;
        }
        this.$$id = id;
        return this;
    };
    Resource.prototype.name = function(name) {
        if (name === undefined) {
            return this.$$name;
        }
        this.$$name = name;
        return this;
    };
    Resource.prototype.params = function(params) {
        if (arguments.length === 2) {
            if (typeof arguments[1] === "undefined") {
                delete this.$$params[arguments[0]];
            } else {
                this.$$params = this.$$params || {};
                this.$$params[arguments[0]] = arguments[1];
            }
        } else if (typeof params === "object") {
            for (var e in params) {
                if (params.hasOwnProperty(e)) {
                    if (typeof params[e] === "undefined") {
                        delete this.$$params[e];
                    } else {
                        this.$$params = this.$$params || {};
                        this.$$params[e] = params[e];
                    }
                }
            }
        }
        return this;
    };
    Resource.prototype.resource = function(name, id) {
        var resource = new Resource(name, id);
        resource.$$parent = this;
        return resource;
    };
    Resource.prototype.$$toUrl = function() {
        var url = "";
        if (this.$$parent) {
            url += this.$$parent.$$toUrl();
        }
        if (typeof this.$$baseUrl === "string") {
            url = this.$$baseUrl;
        } else {
            if (this.$$name) {
                url += "/" + this.$$name;
            }
            if (this.$$id) {
                url += "/" + this.$$id;
            }
        }
        return url;
    };
    Resource.prototype.toUrl = function() {
        var url = this.$$toUrl();
        if (this.$$params) {
            var params = clone(this.$$params);
            url = parseUrl(url, params);
            url += hashToSearch(params);
        }
        return url;
    };
    return function(name, id) {
        var resource;
        if (typeof name === "object") {
            resource = new Resource(name.name, name.id);
            resource.$$baseUrl = name.baseUrl;
        } else {
            resource = new Resource(name, id);
        }
        return resource;
    };
}();

http.defaults.headers["Content-Type"] = "application/json;charset=UTF-8";

dispatcher(exports);

var resources = [{"methods":{"login":{"type":"POST"},"logout":{"type":"GET"},"me":{"type":"GET"}}},{"name":"users","url":"/apps/:appId/users"},{"name":"apps","syntax":"dot"},{"name":"teammates","syntax":"dot","url":"/apps/:appId/team"}];

for (var i = 0; i < resources.length; i += 1) {
    crudify(exports, resources[i], resources[i].methods);
}

window["obogo"] = exports;
})();