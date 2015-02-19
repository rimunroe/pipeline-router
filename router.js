function Router() {
  'use strict';

  this._routes = {};
  var that = this;

  var _register = function(route) {
    that._routes[route.fullPath] = route;
  };

  var _getParams = function(path) {
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
  };

  var _fillOutPath = function(route, parentPath) {
    route.fullPath = parentPath + ((route.path !== '/') ? '/' : '') + route.path;
    route.params = _getParams(route.fullPath);
    _register(route);
  };

  var _fillOutChildPaths = function(route, parentPath) {
    route.children.forEach(function(child) {
      _fillOutPath(child, parentPath);
      if (child.children.length !== 0) _fillOutChildPaths(child, child.fullPath);
    });
  };


  this.Route = function Route(options /*, children */) {
    this.path = (options.path == null) ? '/' : options.path;
    if (options.dynamic === true) {
      this.pattern = (options.pattern != null) ? options.pattern : /[a-zA-Z0-9\+\(\)\-\_]+/;
    } else {
      this.pattern = (options.pattern != null) ? options.pattern : new RegExp(this.path);
    }

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
      var segments = this.fullPath.split('/');
      for (var name in this.params) {
        segments[this.params[name]] = params[name];
      }
      return segments.join('/');
    };
  };

  var matchSegments = function(segments, route, depth){
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
        });
      }
    });

    return matches;
  };

  this.findRouteByPath = function(path){
    var segments = path.split('/');
    segments[0] = '/';
    var matches = matchSegments(segments, this._routes['/'], 0);
    var bestMatch = matches[0];
    matches.forEach(function(match){
      if (match.depth > bestMatch.depth) bestMatch = match;
    });
    return bestMatch.route;
  };

  var matchName = function(route, name){
    if (route.name === name) return route;

    var i;
    for (i = 0; i < route.children.length; i++) {
      var match = matchName(route.children[i], name);
      if (match != null) return match;
    }
    return false;
  };

  this.findRouteByName = function(name){
    return matchName(this._routes['/'], name);
  };

  this.hitRoute = function(path){
    var route = this.findRouteByPath(path);
    var segments = path.split('/');

    var params = {};

    for (var _param in route.params) {
      params[_param.name] = segments[_param.position];
    }

    route.callback.call(null, route.name, params, path);
  };

  this.makeRouteIntoPath = function(page, params){
    var route = this.findRouteByName(page);
    return route.makePath(params);
  };
}

module.exports = Router;
