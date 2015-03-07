function Router() {
  'use strict';

  this._routes = {};
  var that = this;

  var _removeTrailingSlash = function(str){
    return ((str.length > 1) && (str[str.length - 1] === '/')) ? str.slice(0, str.length -1) : str;
  };

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

  this.Route = function Route(options, parentPath) {
    this.path = (options.path == null) ? '/' : options.path;
    if (options.dynamic === true) {
      this.pattern = (options.pattern != null) ? options.pattern : /[a-zA-Z0-9\+\(\)\-\_]+/;
    } else {
      this.pattern = (options.pattern != null) ? options.pattern : new RegExp(this.path);
    }

    var isRoot = (this.path === '/') || (parentPath == null);
    if (isRoot) {
      this.fullPath = '/';
    } else {
      var separator = (parentPath === '/') ? '' : '/';
      this.fullPath = parentPath + separator + this.path;
    }
    this.name = options.name;
    this.handler = options.handler;
    this.children = [];

    var self = this;

    if (Array.isArray(options.children)) {
      options.children.forEach(function(child){
        self.children.push(new Route(child, self.fullPath));
      });
    }

    this.params = _getParams(this.fullPath);

    this.makePath = function(params){
      var segments = this.fullPath.split('/');
      for (var name in this.params) {
        segments[this.params[name]] = params[name];
      }
      return segments.join('/');
    };

    that._routes[this.fullPath] = this;
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
    var segments;

    if (path !== '/') {
      segments = path.split('/');
      segments[0] = '/';
    } else segments = [path];

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
      params[_param] = segments[route.params[_param]];
    }

    route.handler.call(null, route.name, params, path);
  };

  this.makeRouteIntoPath = function(page, params){
    var route = this.findRouteByName(page);
    return route.makePath(params);
  };

  this.areEquivalentPaths = function(pathA, pathB){
    return _removeTrailingSlash(pathA) === _removeTrailingSlash(pathB);
  };

  var _onpopstate = function(e){
    that.hitRoute(window.location.pathname);
  };

  var _onload = function(e){
    that.hitRoute(window.location.pathname);
  };

  this.start = function(){
    window.addEventListener('popstate', _onpopstate);
    window.addEventListener('load', _onload);
    this.hitRoute(window.location.pathname);
  };

}

module.exports = Router;
