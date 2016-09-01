// Generated by CoffeeScript 1.10.0
var db;

module.exports = function(options) {
  var k, ref, ref1, v;
  if (options.db == null) {
    options.db = {};
  }
  ref = options.db;
  for (k in ref) {
    v = ref[k];
    if (options[k] == null) {
      options[k] = v;
    }
  }
  if (options.database == null) {
    options.database = options.argument;
  }
  options.engine = options.engine.toLowerCase();
  if ((ref1 = options.engine) !== 'mysql' && ref1 !== 'postgres') {
    throw Error("Unsupport engine: " + (JSON.stringify(options.engine)));
  }
  return this.wait.execute({
    cmd: (function() {
      switch (options.engine) {
        case 'mysql':
          return db.cmd(options, {
            database: null
          }, "show databases") + (" | grep '" + options.database + "'");
        case 'postgres':
          return db.cmd(options, {
            database: null
          }, null) + (" -l | cut -d \\| -f 1 | grep -qw '" + options.database + "'");
      }
    })()
  });
};

db = require('../../misc/db');