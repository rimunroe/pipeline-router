var path = require('path');

module.exports = {
  entry: path.join(__dirname, "src", "index.js"),
  output: {
    filename: path.join("build", "pipeline-routing.js"),
    libraryTarget: "umd",
    library: "pipelineRouting"
  },
  plugins: []
};
