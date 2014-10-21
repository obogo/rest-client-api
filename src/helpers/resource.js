/* global utils */
var resource = (function () {
    // https://gist.github.com/pduey/2764606
    function hashToSearch(hash) {
        var search = hash ? '?' : '';
        for (var k in hash) {
            if (hash[k].isArray) {
                for (var i = 0; i < hash[k].length; i++) {
                    search += search === '?' ? '' : '&';
                    search += encodeURIComponent(k) + '=' + encodeURIComponent(hash[k][i]);
                }
            } else {
                search += search === '?' ? '' : '&';
                search += encodeURIComponent(k) + '=' + encodeURIComponent(hash[k]);
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

    Resource.prototype.id = function (id) {
        if (id === undefined) {
            return this.$$id;
        }
        this.$$id = id;
        return this;
    };

    Resource.prototype.name = function (name) {
        if (name === undefined) {
            return this.$$name;
        }
        this.$$name = name;
        return this;
    };

    Resource.prototype.params = function (params) {
        if (arguments.length === 2) {
            if (typeof arguments[1] === 'undefined') {
                delete this.$$params[arguments[0]];
            } else {
                this.$$params[arguments[0]] = arguments[1];
            }
        } else if (typeof params === 'object') {
            for (var e in params) {
                if (params.hasOwnProperty(e)) {
                    if (typeof params[e] === 'undefined') {
                        delete this.$$params[e];
                    } else {
                        this.$$params[e] = params[e];
                    }
                }
            }
        }
        return this;
    };

    Resource.prototype.resource = function (name, id) {
        var resource = new Resource(name, id);
        resource.$$parent = this;
        return resource;
    };

    Resource.prototype.$$toUrl = function () {
        var url = '';

        if (this.$$parent) {
            url += this.$$parent.$$toUrl();
        }

        if (typeof this.$$baseUrl === 'string') {
            url = this.$$baseUrl;
        } else {
            if(this.$$name) {
                url += '/' + this.$$name;
            }
            if (this.$$id) {
                url += '/' + this.$$id;
            }
        }


        return url;
    };

    Resource.prototype.toUrl = function () {
        var url = this.$$toUrl();

        if (this.$$params) {
            url += hashToSearch(this.$$params);
        }

        return url;
    };

    return function (name, id) {
        var resource;
        if (typeof name === 'object') {
            resource = new Resource();
            resource.$$baseUrl = name.baseUrl;
        } else {
            resource = new Resource(name, id);
        }
        return resource;
    };

})();