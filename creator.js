var Router = require('./router');

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
      return {
        page: page != null
      };
    };

    var adapterName = 'router';
    var adapterOptions = {
      stores: {
        location: function(){
          var location = _app.stores.location.get();
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
      if (!_.isFunction(routeDef.handler)) {
        if ((options.defaults != null) && (_.isFunction(options.defaults.handler))) {
          routeDef.handler = options.defaults.handler;
        }
        else routeDef.handler = _app.actions.navigate;
      }
      _.forEach(routeDef.children, applyDefaultsToRoutes);
    };

    applyDefaultsToRoutes(routes);

    new _app.router.Route(routes);
  };
};
