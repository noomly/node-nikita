// Generated by CoffeeScript 1.10.0
module.exports = {
  shy: true,
  handler: function(options, callback) {
    var adm_cmd, k, ref, ref1, v;
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
    if (options.host == null) {
      return callback(new Error('Missing hostname'));
    }
    if (options.admin_username == null) {
      return callback(new Error('Missing admin name'));
    }
    if (options.admin_password == null) {
      return callback(new Error('Missing admin password'));
    }
    if (options.name == null) {
      return callback(new Error('Missing name'));
    }
    if (options.engine != null) {
      options.engine = options.engine.toUpperCase();
    }
    if (options.engine == null) {
      options.engine = 'POSTGRES';
    }
    if ((ref1 = options.engine) !== 'MYSQL' && ref1 !== 'POSTGRES') {
      return callback(new Error('Unsupported engine type'));
    }
    options.log({
      message: "Database engine set to " + options.engine,
      level: 'INFO',
      module: 'mecano/db/database/user'
    });
    if (options.port == null) {
      options.port = 5432;
    }
    adm_cmd = '';
    switch (options.engine) {
      case 'MYSQL':
        adm_cmd += 'mysql';
        adm_cmd += " -h " + options.host;
        adm_cmd += " -u " + options.admin_username;
        adm_cmd += " -p " + options.admin_password;
        break;
      case 'POSTGRES':
        adm_cmd += "PGPASSWORD=" + options.admin_password + " psql";
        adm_cmd += " -h " + options.host;
        adm_cmd += " -U " + options.admin_username;
        break;
      default:
        break;
    }
    return this.execute({
      cmd: adm_cmd + " -tAc \"SELECT 1 FROM pg_roles WHERE rolname='" + options.name + "'\" | grep 1",
      code_skipped: 1
    }, function(err, status, stdout, stderr) {
      return callback(err, status, stdout, stderr);
    });
  }
};