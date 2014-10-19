var exports = {};
dispatcher(exports);
var resources = !!resources;
for (var i = 0; i < resources.length; i += 1) {
    crudify(exports, resources[i].name, resources.methods);
}
window['!!name'] = exports;
