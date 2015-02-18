var util = require('util');

function Router() {
  this._routes = {};
  var that = this;

  function _register(route) {
    that._routes[route.fullPath] = route;
  }

  function _getParams(path) {
    var segments = path.split('/');
    var positions = {};

    var i;
    for (i = 0; i < segments.length; i++) {
      var segment = segments[i];

      if (segment[0] === ':') {
        positions[segment.slice(1, segment.length)] = i;
      }
    }
    return positions;
  }

  function _fillOutPath(route, parentPath) {
    route.fullPath = parentPath + ((route.path !== '/') ? '/' : '') + route.path;
    route.params = _getParams(route.fullPath);
    _register(route);
  }

  function _fillOutChildPaths(route, parentPath) {
    route.children.forEach(function(child) {
      _fillOutPath(child, parentPath);
      if (child.children.length !== 0) _fillOutChildPaths(child, child.fullPath);
    })
  }


  this.Route = function(options /*, children */) {
    this.path = (options.path == null) ? '/' : options.path;
    this.pattern = (options.pattern == null) ? RegExp(this.path) : options.pattern ;
    this.fullPath = options.path;
    this.name = options.name;
    this.callback = options.callback;
    this.children = [];

    var isRoot = options.path === '/';

    var i;
    for (i = 1; i < arguments.length; i++) {
      var child = arguments[i];
      this.children.push(child);
    }

    if (isRoot) {
      _fillOutPath(this, '');
      _fillOutChildPaths(this, '');
    }
  }
}

module.exports = Router;
