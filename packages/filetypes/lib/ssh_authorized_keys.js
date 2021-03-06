// Generated by CoffeeScript 2.3.2
// `nikita.file.types.ssh_authorized_keys`

// Note, due to the restrictive permission imposed by sshd on the parent directory,
// this action will not attempt to create nor modify the parent directory and will
// throw an Error if it does not exists.

// ## Options

// * `gid`   
//   File group name or group id.
// * `keys`   
//   Array containing the public keys.
// * `merge` (string)   
//   File to write, default to "/etc/pacman.conf".
// * `mode`   
//   File mode (permission and sticky bits), default to `0o0644`, in the form of
// `{mode: 0o0744}` or `{mode: "0744"}`.
// * `target` (string)   
//   File to write, default to "/etc/pacman.conf".
// * `uid`   
//   File user name or user id.

// ## Source Code
var misc, path;

module.exports = function({options}) {
  var key;
  if (!options.target) {
    throw Error(`Required Option: target, got ${JSON.stringify(options.target)}`);
  }
  if (!options.keys) {
    throw Error(`Required Option: keys, got ${JSON.stringify(options.keys)}`);
  }
  if (!Array.isArray(options.keys)) {
    throw Error(`Invallid Option: keys must be an array, got ${JSON.stringify(options.keys)}`);
  }
  this.file.assert({
    target: path.dirname(options.target)
  });
  this.file({
    unless: options.merge,
    target: options.target,
    content: options.keys.join('\n'),
    uid: options.uid,
    gid: options.gid,
    mode: options.mode,
    eof: true
  });
  return this.file({
    if: options.merge,
    target: options.target,
    write: (function() {
      var i, len, ref, results;
      ref = options.keys;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        results.push({
          match: new RegExp(`.*${misc.regexp.escape(key)}.*`, 'mg'),
          replace: key,
          append: true
        });
      }
      return results;
    })(),
    uid: options.uid,
    gid: options.gid,
    mode: options.mode,
    eof: true
  });
};

// ## Dependencies
path = require('path');

misc = require('@nikitajs/core/lib/misc');
