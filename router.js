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
    if (options.dynamic === true) {
      this.pattern = (options.pattern != null) ? options.pattern : /[a-zA-Z0-9]+/;
    } else {
      this.pattern = (options.pattern != null) ? options.pattern : RegExp(this.path);
    }
    // this.pattern = (options.pattern == null) ? RegExp(this.path) : options.pattern;
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

    this.makePath = function(params){
      segments = this.fullPath.split('/');
      for (var name in this.params) {
        segments[this.params[name]] = params[name];
      }
      return segments.join('/');
    }
  }

  function matchSegments(segments, route, depth){
    var matches = [];
    if (route.pattern.test(segments[0])) {
      matches.push({
        route: route,
        depth: depth
      });
    }
    route.children.forEach(function(child){
      if (child.pattern.test(segments.slice(1, segments.length))) {
        var childMatches = matchSegments(segments.slice(1, segments.length), child, depth + 1);
        childMatches.forEach(function(match){
          matches.push(match);
        })
      }
    });

    return matches;
  }

  this.findRouteByPath = function(path){
    var segments = path.split('/');
    segments[0] = '/';
    var matches = matchSegments(segments, this._routes['/'], 0);
    var bestMatch = matches[0];
    matches.forEach(function(match){
      if (match.depth > bestMatch.depth) bestMatch = match;
    });
    return bestMatch.route;
  }

  function matchName(route, name){
    if (route.name === name) return route;

    var i;
    for (var i = 0; i < route.children.length; i++) {
      var match = matchName(route.children[i], name);
      if (match != null) return match;
    }
    return false;
  }

  this.findRouteByName = function(name){
    return matchName(this._routes['/'], name);
  }

  this.hitRoute = function(path){
    var route = this.findRouteByPath(path);
    var segments = path.split('/');

    var params = {};

    for (var _param in route.params) {
      params[_param.name] = segments[_param.position];
    }

    route.callback.call(null, route.name, params, path);
  }

  this.makeRouteIntoPath = function(page, params){
    var route = this.findRouteByName(page);
    return route.makePath(params);
  }
}

module.exports = Router;
