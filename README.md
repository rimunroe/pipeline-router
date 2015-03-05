# pipeline-routing

A simple router to be used with [Pipeline](https://github.com/rimunroe/pipeline).

## Declaring routes

A route is defined through an object with the following structure:

```javascript
{
  name: 'home',
  path: '/',
  dynamic: false,
  pattern: /[a-zA-Z0-9\+\(\)\-\_]+/
  handler: function(page, params){/*...*/},
  children: [/*...*/]
}
```

### name

The name is a string, and must be unique among all route names.

### path

This is the path, relative to the parent, this route will be found.

*Note*: The only path where a forward slash can appear is the root.

### pattern (optional)

A regular expression used to test whether or not a URL matches the current route.

Defaults to

### dynamic (optional)

A boolean indicating whether or not this path represents a dynamic segment. If it is true, then anything matching its pattern will be used as a parameter.

### handler (optional)

This is the function which will be called when the route is hit. It takes two arguments: the new page's name and an object listing the keys and values of any dynamic route segments at the current location.

The default handler for all routes is to fire the navigation action.

### children (optional)

This is an array containing route definition objects with the same structure.

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
