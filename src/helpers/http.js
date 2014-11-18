var http = (function () {
    /**
     * Module dependencies.
     */
    var serialize = function (obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };

    var win = window,
        CORSxhr = (function () {
            var xhr;

            if (win.XMLHttpRequest && ('withCredentials' in new win.XMLHttpRequest())) {
                xhr = win.XMLHttpRequest;

            } else if (win.XDomainRequest) {
                xhr = win.XDomainRequest;
            }

            return xhr;
        }()),
        methods = ['head', 'get', 'post', 'put', 'delete'],
        i = 0,
        methodsLength = methods.length,
        result = {},
        mockMode,
        mockRegistry = [];

    function Request(options) {
        this.init(options);
    }

    Request.prototype.init = function (options) {
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

    Request.prototype.send = function () {
        var that = this;

        // serialize data if GET
        if (that.method === 'GET' && that.data) {
            var concat = that.url.indexOf('?') > -1 ? '&' : '?';
            that.url += concat + serialize(that.data);
        } else {
            that.data = JSON.stringify(that.data);
        }

        // Success callback
        if (that.success !== undefined) {
            that.xhr.onload = function () {
                var headers = parseResponseHeaders(this.getAllResponseHeaders());
                var response = this.responseText;
                if (headers.contentType && headers.contentType.indexOf('application/json') !== -1) {
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

        // Error callback
        if (that.error !== undefined) {
            that.xhr.error = function () {
                that.error.call(this, this.responseText);
            };
        }

        that.xhr.open(that.method, that.url, true);

        if (that.headers !== undefined) {
            that.setHeaders();
        }

        // Send
        that.xhr.send(that.data, true);

        return that;
    };

    Request.prototype.setHeaders = function () {
        var that = this,
            headers = that.headers,
            key;

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
            parts = list[i].split(': ');
            if (parts[0] && parts[1]) {
                parts[0] = parts[0].split('-').join('').split('');
                parts[0][0] = parts[0][0].toLowerCase();
                headers[parts[0].join('')] = parts[1];
            }
            i += 1;
        }
        return headers;
    }

    function addDefaults(options, defaults) {
        for (var i in defaults) {
            if (defaults.hasOwnProperty(i) && options[i] === undefined) {
                if (typeof defaults[i] === 'object') {
                    options[i] = {};
                    addDefaults(options[i], defaults[i]);
                } else {
                    options[i] = defaults[i];
                }
            }
        }
        return options;
    }

    function findAdapter(options) {
        var i, len = mockRegistry.length, mock, result;
        for (i = 0; i < len; i += 1) {
            mock = mockRegistry[i];
            if (mock.type === "string" || mock.type === "object") {
                result = options.url.match(mock.matcher);
            } else if (mock.type === "function") {
                result = mock.matcher(options);
            }
            if (result) {
                result = mock.adapter;
            }
        }
        return result;
    }

    /**
     * Public Methods
     */
    for (i; i < methodsLength; i += 1) {
        /* jshint ignore:start */
        (function () {
            var method = methods[i];
            result[method] = function (url, success) {
                var options = {}, adapter, adapterResult;

                if (url === undefined) {
                    throw new Error('CORS: url must be defined');
                }

                if (typeof url === 'object') {
                    options = url;

                } else {
                    if (typeof success === 'function') {
                        options.success = success;
                    }

                    options.url = url;
                }

                options.method = method.toUpperCase();
                addDefaults(options, result.defaults);
                if (mockMode) {
                    adapter = findAdapter(options);
                    if (adapter) {
                        adapterResult = adapter(options);
                        if (adapterResult === true) {
                            options.method = "GET";
                            return new Request(options).xhr;
                        }
                        return adapterResult;
                    } else if (window.console && console.warn) {
                        console.warn("No adapter found for " + options.url + ". Adapter required in mock mode.");
                    }
                }
                return new Request(options).xhr;
            };
        }());
        /* jshint ignore:end */
    }
    result.mock = function (enable) {
        mockMode = !!enable;
    };
    /**
     * registerMock
     * @param {string|regEx|fn} matcher
     * @param {constructor} adapter
     */
    result.registerMock = function (matcher, adapter) {
        mockRegistry.push({matcher: matcher, type: typeof matcher, adapter: adapter});
    };
    result.defaults = {
        headers: {}
    };
    return result;
}());