// Generated by CoffeeScript 2.3.2
// # `nikita.db.database.exists`

// Check if a database exists.

// ## Options

// * `admin_username`   
//   The login of the database administrator.   
// * `admin_password`   
//   The password of the database administrator.   
// * `database` (String)   
//   The database name to check for existance.   
// * `engine`   
//   The engine type, can be MySQL or PostgreSQL, default to MySQL.   
// * `host`   
//   The hostname of the database.   
// * `port`   
//   Port to the associated database.   
// * `username`   
//   The username of a user with privileges on the database, used unless admin_username is provided.   
// * `password`   
//   The password of a user with privileges on the database, used unless admin_password is provided.   

// ## Source Code
var db;

module.exports = {
  shy: true,
  handler: function({options}) {
    var cmd, k, ref, ref1, v;
    // Import options from `options.db`
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
    if (!options.host) {
      // Check main options
      throw Error('Missing option: "host"');
    }
    if (!(options.admin_username || options.username)) {
      throw Error('Missing option: "username" or "admin_username"');
    }
    if (options.admin_username && !options.admin_password) {
      throw Error('Missing option: "admin_password"');
    }
    if (options.username && !options.password) {
      throw Error('Missing option: "password"');
    }
    // Deprecation
    if (options.engine === 'postgres') {
      console.log('Deprecated Value: options "postgres" is deprecated in favor of "postgresql"');
      options.engine = 'postgresql';
    }
    // Defines and check the engine type
    options.engine = options.engine.toLowerCase();
    if ((ref1 = options.engine) !== 'mariadb' && ref1 !== 'mysql' && ref1 !== 'postgresql') {
      throw Error(`Unsupport engine: ${JSON.stringify(options.engine)}`);
    }
    // Defines port
    if (options.port == null) {
      options.port = 5432;
    }
    cmd = (function() {
      switch (options.engine) {
        case 'mariadb':
        case 'mysql':
          return db.cmd(options, {
            database: 'mysql'
          }, "SHOW DATABASES") + ` | grep -w '${options.database}'`;
        case 'postgresql':
          // Not sure why we're not using \l
          return db.cmd(options, `SELECT datname FROM pg_database WHERE datname = '${options.database}'`) + ` | grep -w '${options.database}'`;
      }
    })();
    return this.system.execute({
      cmd: cmd,
      code_skipped: 1
    });
  }
};

// ## Dependencies
db = require('@nikita/core/lib/misc/db');