/*
* myapi v.1.0.0
*/
(function() {
var crudify = function() {
    var $methods = {};
    $methods.all = function(name) {
        return function(params) {
            var url = resource(name).params(params).toUrl();
            var deferred = defer();
            http.get(url, function(response) {
                deferred.resolve(response);
                exports.dispatch(name + "::all", response);
            });
            return deferred.promise;
        };
    };
    $methods.create = function(name) {
        return function(data, params) {
            var url = resource(name).params(params).toUrl();
            var deferred = defer();
            http.post(url, data, function(response) {
                deferred.resolve(response);
                exports.dispatch(name + "::create", response);
            });
            return deferred.promise;
        };
    };
    $methods.get = function(name) {
        return function(id, params) {
            var url = resource(name, id).params(params).toUrl();
            var deferred = defer();
            http.get(url, function(response) {
                deferred.resolve(response);
                exports.dispatch(name + "::get", response);
            });
            return deferred.promise;
        };
    };
    $methods.update = function(name) {
        return function(id, data, params) {
            var url = resource(name, id).params(params).toUrl();
            var deferred = defer();
            http.put(url, data, function(response) {
                deferred.resolve(response);
                exports.dispatch(name + "::update", response);
            });
            return deferred.promise;
        };
    };
    $methods.delete = function(name) {
        return function(id, params) {
            var url = resource(name, id).params(params).toUrl();
            var deferred = defer();
            http.delete(url, function(response) {
                deferred.resolve(response);
                exports.dispatch(name + "::delete", response);
            });
            return deferred.promise;
        };
    };
    return function(target, name, methods) {
        if (!methods) {
            methods = "all create get update delete";
        }
        methods = methods.split(" ");
        var resource = target[name] = {};
        var methodName;
        for (var i = 0; i < methods.length; i++) {
            methodName = methods[i];
            if ($methods.hasOwnProperty(methodName)) {
                resource[methodName] = $methods[methodName](name);
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
        target.dispatch = scope[map.dispatch].bind(scope);
    } else {
        target.on = on;
        target.off = off;
        target.once = once;
        target.dispatch = dispatch;
    }
    target.getListeners = getListeners;
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
                that.success.call(this, this.responseText);
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
                return new Request(options).xhr;
            };
        })();
    }
    return result;
}();

Array.prototype.isArray = true;

var resource = function() {
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
        this.$$name = name;
        this.$$parent = null;
        this.$$params = {};
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
                this.$$params[arguments[0]] = arguments[1];
            }
        } else if (typeof params === "object") {
            for (var e in params) {
                if (params.hasOwnProperty(e)) {
                    if (typeof params[e] === "undefined") {
                        delete this.$$params[e];
                    } else {
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
        if (this.$$baseUrl) {
            url = this.$$baseUrl;
        } else {
            url += "/" + this.$$name;
            if (this.$$id) {
                url += "/" + this.$$id;
            }
        }
        return url;
    };
    Resource.prototype.toUrl = function() {
        var url = this.$$toUrl();
        if (this.$$params) {
            url += hashToSearch(this.$$params);
        }
        return url;
    };
    return function(name, id) {
        var resource;
        if (typeof name === "object") {
            resource = new Resource();
            resource.$$baseUrl = name.baseUrl;
        } else {
            resource = new Resource(name, id);
        }
        return resource;
    };
}();

var exports = {};

dispatcher(exports);

var resources = [{"name":"users","methods":""}];

for (var i = 0; i < resources.length; i += 1) {
    crudify(exports, resources[i].name, resources.methods);
}

window["myapi"] = exports;
})();