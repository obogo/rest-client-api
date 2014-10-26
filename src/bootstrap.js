/* global exports, dispatcher, crudify, http */

// set default content-type
http.defaults.headers['Content-Type'] = 'application/json;charset=UTF-8';

// make api a dispatcher
dispatcher(exports);

var resources = !!resources;
for (var i = 0; i < resources.length; i += 1) {
    crudify(exports, resources[i], resources.methods);
}

window['!!name'] = exports;
