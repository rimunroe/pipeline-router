var creator = require('./creator');

module.exports = {
  name: 'pipeline-router',
  factories: {
    router: creator
  },
  startHook: function(app){
    app.router.start();
  }
};
