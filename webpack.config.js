var path = require('path');

module.exports = {
  entry: path.join(__dirname, "src", "index.js"),
  output: {
    filename: path.join("build", "pipeline-router.js"),
    libraryTarget: "umd",
    library: "pipeline-router"
  }
};
