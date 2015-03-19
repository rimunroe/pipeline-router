(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["pipelineRouting"] = factory();
	else
		root["pipelineRouting"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var creator = __webpack_require__(1);

	module.exports = {
	  name: 'pipeline-router',
	  factories: {
	    router: creator
	  },
	  startHook: function(app){
	    app.router.start();
	  }
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Router = __webpack_require__(2);

	module.exports = function (_app){
	  return function(options){
	    _app.router = new Router();

	    var routeSpecifications = (options.routes != null) ? options.routes : {};
	    var routes = options.routes;

	    var storeName = 'location';
	    var storeOptions = {
	      actions: {
	        navigate: function(page, params){
	          this.update({page: page, params: params});
	        }
	      }
	    };

	    var actionName = 'navigate';
	    var actionValidator = function(page, params){
	      this.require((page != null), 'You must pass a "page" argument to "navigate"');
	    };

	    var adapterName = 'router';
	    var adapterOptions = {
	      stores: {
	        location: function(){
	          var location = this.stores.location.get();
	          var newPath = _app.router.makeRouteIntoPath(location.page, location.params);
	          var oldPath = window.location.pathname;

	          if (!_app.router.areEquivalentPaths(oldPath, newPath)) {
	            window.history.pushState({}, location.page, newPath);
	          }
	        }
	      }
	    };

	    var shouldCreate = {
	      action: true,
	      store: true,
	      adapter: true
	    };

	    if (options.defaults != null) {
	      if (options.defaults.action != null) {
	        if (options.defaults.action !== false) {
	          if (options.defaults.action.name != null) actionName = options.defaults.action.name;
	          if (options.defaults.action.validator != null) actionValidator = options.defaults.action.validator;
	        } else shouldCreate.action = false;
	      }

	      if (options.defaults.store != null) {
	        if (options.defaults.store !== false) {
	          if (options.defaults.store.name != null) storeName = options.defaults.store.name;
	          if (options.defaults.store.actions != null) storeOptions.actions = options.defaults.store.actions;
	        } else shouldCreate.store = false;
	      }

	      if (options.defaults.adapter != null) {
	        if (options.defaults.adapter !== false) {
	          if (options.defaults.adapter.name != null) adapterName = options.defaults.adapter.name;
	          if (options.defaults.adapter.actions != null) adapterOptions.actions = options.defaults.adapter.actions;
	        } else shouldCreate.adapter = false;
	      }
	    }

	    if (shouldCreate.action) _app.create.action(actionName, actionValidator);
	    if (shouldCreate.store) _app.create.store(storeName, storeOptions);
	    if (shouldCreate.adapter) _app.create.adapter(adapterName, adapterOptions);


	    var applyDefaultsToRoutes = function(routeDef){
	      if (typeof routeDef !== 'function') {
	        if ((options.defaults != null) && (typeof options.defaults.handler === 'function')) {
	          routeDef.handler = options.defaults.handler;
	        }
	        else routeDef.handler = _app.actions.navigate;
	      }
	      if (routeDef.children != undefined) routeDef.children.forEach(applyDefaultsToRoutes);
	    };

	    applyDefaultsToRoutes(routes);

	    new _app.router.Route(routes);
	  };
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

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


/***/ }
/******/ ])
});
