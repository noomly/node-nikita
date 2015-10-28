// Generated by CoffeeScript 1.10.0
var misc, string, uid_gid;

module.exports = function(options, callback) {
  var do_create, do_end, do_info, do_password, do_uid_gid, do_update, groups_info, modified, user_info;
  if (!options.name) {
    return callback(new Error("Option 'name' is required"));
  }
  if (options.shell === false) {
    options.shell = "/sbin/nologin";
  }
  if (options.shell === true) {
    options.shell = "/bin/bash";
  }
  if (options.system == null) {
    options.system = false;
  }
  if (options.gid == null) {
    options.gid = null;
  }
  if (options.password_sync == null) {
    options.password_sync = true;
  }
  if (typeof options.groups === 'string') {
    options.groups = options.groups.split(',');
  }
  if (typeof options.shell === "function" ? options.shell(typeof options.shell !== 'string') : void 0) {
    return callback(new Error("Invalid option 'shell': " + (JSON.strinfigy(options.shell))));
  }
  modified = false;
  user_info = groups_info = null;
  do_uid_gid = function() {
    return uid_gid(options, function(err) {
      if (err) {
        return callback(err);
      }
      return do_info();
    });
  };
  do_info = function() {
    if (typeof options.log === "function") {
      options.log("Mecano `user`: get user information for " + options.name + " [DEBUG]");
    }
    options.store.cache_passwd = void 0;
    return uid_gid.passwd(options.ssh, options.store, function(err, users) {
      if (err) {
        return callback(err);
      }
      if (typeof options.log === "function") {
        options.log("Mecano `user`: got " + (JSON.stringify(users[options.name])) + " [INFO]");
      }
      user_info = users[options.name];
      if (!user_info) {
        return do_create();
      }
      if (!options.groups) {
        return do_update();
      }
      options.store.cache_group = null;
      return uid_gid.group(options.ssh, options.store, function(err, groups) {
        if (err) {
          return callback(err);
        }
        groups_info = groups;
        return do_update();
      });
    });
  };
  do_create = (function(_this) {
    return function() {
      var cmd;
      cmd = 'useradd';
      if (options.system) {
        cmd += " -r";
      }
      if (!options.home) {
        cmd += " -M";
      }
      if (options.home) {
        cmd += " -d " + options.home;
      }
      if (options.shell) {
        cmd += " -s " + options.shell;
      }
      if (options.comment) {
        cmd += " -c " + (string.escapeshellarg(options.comment));
      }
      if (options.uid) {
        cmd += " -u " + options.uid;
      }
      if (options.gid) {
        cmd += " -g " + options.gid;
      }
      if (options.expiredate) {
        cmd += " -e " + options.expiredate;
      }
      if (options.inactive) {
        cmd += " -f " + options.inactive;
      }
      if (options.groups) {
        cmd += " -G " + (options.groups.join(','));
      }
      if (options.skel) {
        cmd += " -k " + options.skel;
      }
      cmd += " " + options.name;
      return _this.execute({
        cmd: cmd,
        code_skipped: 9
      }).chown({
        destination: options.home,
        uid: options.uid,
        gid: options.gid,
        if_exists: options.home,
        not_if: options.no_home_ownership
      }).then(function(err, created) {
        if (err) {
          return callback(err);
        }
        if (created) {
          modified = true;
          return do_password();
        } else {
          if (typeof options.log === "function") {
            options.log("Mecano `user`: user defined elsewhere than '/etc/passwd', exit code is 9 [WARN]");
          }
          return callback(null, modified);
        }
      });
    };
  })(this);
  do_update = (function(_this) {
    return function() {
      var changed, cmd, group, i, j, k, len, len1, ref, ref1;
      changed = false;
      ref = ['uid', 'home', 'shell', 'comment', 'gid'];
      for (i = 0, len = ref.length; i < len; i++) {
        k = ref[i];
        if ((options[k] != null) && user_info[k] !== options[k]) {
          changed = true;
        }
      }
      if (options.groups) {
        ref1 = options.groups;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          group = ref1[j];
          if (!groups_info[group]) {
            return callback(err("Group does not exist: " + group));
          }
          if (groups_info[group].user_list.indexOf(options.name) === -1) {
            changed = true;
          }
        }
      }
      if (!changed) {
        if (typeof options.log === "function") {
          options.log("Mecano `user`: user " + options.name + " not modified [DEBUG]");
        }
      }
      if (changed) {
        if (typeof options.log === "function") {
          options.log("Mecano `user`: user " + options.name + " modified [WARN]");
        }
      }
      cmd = 'usermod';
      if (options.home) {
        cmd += " -d " + options.home;
      }
      if (options.shell) {
        cmd += " -s " + options.shell;
      }
      if (options.comment != null) {
        cmd += " -c " + (string.escapeshellarg(options.comment));
      }
      if (options.gid) {
        cmd += " -g " + options.gid;
      }
      if (options.groups) {
        cmd += " -G " + (options.groups.join(','));
      }
      if (options.uid) {
        cmd += " -u " + options.uid;
      }
      cmd += " " + options.name;
      _this.execute({
        cmd: cmd,
        "if": changed
      });
      _this.chown({
        destination: options.home,
        uid: options.uid,
        gid: options.gid,
        "if": options.home && (options.uid || options.gid),
        if_exists: options.home,
        not_if: options.no_home_ownership
      });
      return _this.then(function(err, changed, __, stderr) {
        if ((err != null ? err.code : void 0) === 8) {
          return callback(new Error("User " + options.name + " is logged in"));
        }
        if (err) {
          return callback(err);
        }
        if (changed) {
          modified = true;
        }
        return do_password();
      });
    };
  })(this);
  do_password = (function(_this) {
    return function() {
      return _this.execute({
        cmd: "echo " + options.password + " | passwd --stdin " + options.name,
        "if": options.password_sync && options.password
      }, function(err, modified) {
        if (err) {
          return callback(err);
        }
        if (modified) {
          if (typeof options.log === "function") {
            options.log('Mecano `ldap_user`: password modified [WARN]');
          }
        }
        return do_end();
      });
    };
  })(this);
  do_end = function() {
    return callback(null, modified);
  };
  return do_uid_gid();
};

misc = require('../misc');

string = require('../misc/string');

uid_gid = require('../misc/uid_gid');