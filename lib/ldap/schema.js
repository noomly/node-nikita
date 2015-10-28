// Generated by CoffeeScript 1.10.0
var ldap;

module.exports = function(options, callback) {
  var binddn, conf, do_clean, do_configure, do_register, do_registered, do_rename, do_write, ldif, modified, passwd, schema, tempdir, uri;
  binddn = options.binddn ? "-D " + options.binddn : '';
  passwd = options.passwd ? "-w " + options.passwd : '';
  if (options.url) {
    console.log("Mecano: option 'options.url' is deprecated, use 'options.uri'");
    if (options.uri == null) {
      options.uri = options.url;
    }
  }
  if (options.uri === true) {
    options.uri = 'ldapi:///';
  }
  uri = options.uri ? "-H " + options.uri : '';
  if (!options.name) {
    return callback(new Error("Missing name"));
  }
  if (!options.schema) {
    return callback(new Error("Missing schema"));
  }
  options.schema = options.schema.trim();
  tempdir = options.tempdir || ("/tmp/mecano_ldap_schema_" + (Date.now()));
  schema = tempdir + "/" + options.name + ".schema";
  conf = tempdir + "/schema.conf";
  ldif = tempdir + "/ldif";
  modified = false;
  do_registered = (function(_this) {
    return function() {
      var cmd;
      cmd = "ldapsearch -LLL " + binddn + " " + passwd + " " + uri + " -b \"cn=schema,cn=config\" | grep -E cn=\\{[0-9]+\\}" + options.name + ",cn=schema,cn=config";
      if (typeof options.log === "function") {
        options.log("Check if schema is registered:");
      }
      return _this.execute({
        cmd: cmd,
        code: 0,
        code_skipped: 1
      }, function(err, registered, stdout) {
        if (err) {
          return callback(err);
        }
        if (registered) {
          return callback();
        }
        return do_write();
      });
    };
  })(this);
  do_write = (function(_this) {
    return function() {
      return _this.call(function() {
        return typeof options.log === "function" ? options.log('Create ldif directory') : void 0;
      }).mkdir({
        destination: ldif,
        ssh: options.ssh
      }).call(function() {
        return typeof options.log === "function" ? options.log('Copy schema') : void 0;
      }).copy({
        source: options.schema,
        destination: schema,
        ssh: options.ssh
      }).call(function() {
        return typeof options.log === "function" ? options.log('Prepare configuration') : void 0;
      }).write({
        content: "include " + schema,
        destination: conf,
        ssh: options.ssh,
        log: options.log
      }).call(function() {
        return typeof options.log === "function" ? options.log('Generate configuration') : void 0;
      }).execute({
        cmd: "slaptest -f " + conf + " -F " + ldif
      }).call(function() {
        return typeof options.log === "function" ? options.log('Rename configuration') : void 0;
      }).then(function(err) {
        if (err) {
          return callback(err);
        }
        return do_rename();
      });
    };
  })(this);
  do_rename = (function(_this) {
    return function() {
      if (typeof options.log === "function") {
        options.log('Rename configuration');
      }
      return _this.move({
        source: ldif + "/cn=config/cn=schema/cn={0}" + options.name + ".ldif",
        destination: ldif + "/cn=config/cn=schema/cn=" + options.name + ".ldif",
        force: true
      }, function(err, moved) {
        if (err) {
          return callback(err);
        }
        if (!moved) {
          return new Error('No generated schema');
        }
        return do_configure();
      });
    };
  })(this);
  do_configure = (function(_this) {
    return function() {
      if (typeof options.log === "function") {
        options.log('Prepare ldif');
      }
      return _this.write({
        destination: ldif + "/cn=config/cn=schema/cn=" + options.name + ".ldif",
        write: [
          {
            match: /^dn: cn.*$/mg,
            replace: "dn: cn=" + options.name + ",cn=schema,cn=config"
          }, {
            match: /^cn: {\d+}(.*)$/mg,
            replace: 'cn: $1'
          }, {
            match: /^structuralObjectClass.*/mg,
            replace: ''
          }, {
            match: /^entryUUID.*/mg,
            replace: ''
          }, {
            match: /^creatorsName.*/mg,
            replace: ''
          }, {
            match: /^createTimestamp.*/mg,
            replace: ''
          }, {
            match: /^entryCSN.*/mg,
            replace: ''
          }, {
            match: /^modifiersName.*/mg,
            replace: ''
          }, {
            match: /^modifyTimestamp.*/mg,
            replace: ''
          }
        ]
      }, function(err, written) {
        if (err) {
          return callback(err);
        }
        return do_register();
      });
    };
  })(this);
  do_register = (function(_this) {
    return function() {
      var cmd;
      cmd = "ldapadd " + uri + " " + binddn + " " + passwd + " -f " + ldif + "/cn=config/cn=schema/cn=" + options.name + ".ldif";
      if (typeof options.log === "function") {
        options.log("Add schema: " + cmd);
      }
      return _this.execute({
        cmd: cmd
      }, function(err, executed) {
        if (err) {
          return callback(err);
        }
        modified = true;
        return do_clean();
      });
    };
  })(this);
  do_clean = (function(_this) {
    return function() {
      if (typeof options.log === "function") {
        options.log('Clean up');
      }
      return _this.remove({
        destination: tempdir
      }, function(err, removed) {
        return callback(err, modified);
      });
    };
  })(this);
  return do_registered();
};

ldap = require('ldapjs');