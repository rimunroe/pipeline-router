var path = require('path');

module.exports = {
  entry: path.join(__dirname, "index.js"),
  output: {
    filename: 'pipeline-router.js',
    libraryTarget: "umd",
    library: "pipeline-router"
  }
};
