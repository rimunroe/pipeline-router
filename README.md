# pipeline-routing

A simple router to be used with [Pipeline](https://github.com/rimunroe/pipeline).

## Example use

```javascript
var pipeline = require('pipeline');
var routing = require('pipeline-routing');

var app = pipeline.createApp({
  initialize: function(){
    console.log('app initialization hook');
  },
  plugins: [
    routing
  ]
});

app.create.router({
  routes: {
    name: 'home',
    path: '/',
    children: [{
      name: 'list',
      path: 'list',
      children: [{
        name: 'item',
        path: ':itemId',
        dynamic: true
      }]
    }]
  }
});

app.start();

```

## Installation

`npm install pipeline-routing`
