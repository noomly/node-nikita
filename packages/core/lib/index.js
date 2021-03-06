// Generated by CoffeeScript 2.3.2
// # Nikita

// This is the main Nikita entry point. It expose a function to initialize a new
// Nikita session.

// ## Source Code
var registry, session;

module.exports = new Proxy((function() {
  return session(...arguments);
}), {
  get: function(target, name) {
    var builder, ctx, proxy, tree;
    if (name === 'registry') {
      return registry;
    }
    ctx = session();
    if (!ctx[name]) {
      return void 0;
    }
    if (name === 'cascade') {
      return ctx[name];
    }
    tree = [];
    tree.push(name);
    builder = function() {
      var a;
      a = ctx[tree.shift()];
      if (typeof a !== 'function') {
        return a;
      }
      while (name = tree.shift()) {
        a[name];
      }
      return a.apply(ctx, arguments);
    };
    proxy = new Proxy(builder, {
      get: function(target, name) {
        tree.push(name);
        if (!registry.registered(tree, {
          parent: true
        })) {
          tree = [];
          return void 0;
        }
        return proxy;
      }
    });
    return proxy;
  }
});

// ## Dependencies
session = require('./session');

registry = require('./registry');

require('./register');
