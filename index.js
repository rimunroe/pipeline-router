var creator = require('./creator');

module.exports = {
  factories: {
    router: creator
  },
  startHook: function(app){
    app.router.start();
  }
};
