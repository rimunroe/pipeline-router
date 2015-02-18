function Router(){
  this.createRoute = function(options /*, children */){
    var route = {};
    route.path = (options.path == null) ? '/' : options.path;
    route.name = options.name;
    route.callback = options.callback;

    function isParam(segment){
      return segment[0] === ':';
    }

    function getParams(path){
      var segments = path.split('/');
      // var segments = (splitPath.indexOf('/') > 0) ? splitPath.slice(1, splitPath.length) : splitPath;

      var i;
      var positions = {};
      for(i = 0; i < segments.length; i++){
        var segment = segments[i];

        if (segment[0] === ':') {
          positions[segment.slice(1, segment.length)] = i;
        }
      }
      return positions;
    }

    route.params = getParams(route.path);

    var routes = [route];
    var i;

    for(i = 1; i < arguments.length; i++){
      var childRoutesBundle = arguments[i];

      var j;
      for(j = 0; j < childRoutesBundle.length; j++){
        var childRoute = childRoutesBundle[j];
        childRoute.path = route.path + ((route.path !== '/') ? '/' : '') + childRoute.path;
        childRoute.params = getParams(childRoute.path);
        routes.push(childRoute);
      }
    }

    return routes;
  }

}

module.exports = Router;
