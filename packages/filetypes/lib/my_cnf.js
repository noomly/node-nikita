// Generated by CoffeeScript 2.3.2
// `nikita.file.types.my_cnf`

// Write file in the mysql ini format by default located in "/etc/my.cnf".

// ## Options

// * `rootdir` (string, optional, undefined)   
//   Path to the mount point corresponding to the root directory, optional.
// * `backup` (string|boolean, optional, false)   
//   Create a backup, append a provided string to the filename extension or a
//   timestamp if value is not a string, only apply if the target file exists and
//   is modified.
// * `clean` (boolean, optional, false)   
//   Remove all the lines whithout a key and a value, default to "true".
// * `content` (object, required)   
//   Object to stringify.
// * `merge` (boolean, optional, false)   
//   Read the target if it exists and merge its content.
// * `target` (string, optional, "/etc/pacman.conf")   
//   Destination file.

// ## Source Code
var misc;

module.exports = function({options}) {
  this.log({
    message: "Entering file.types.my_cnf",
    level: 'DEBUG',
    module: 'nikita/lib/file/types/my_cnf'
  });
  if (options.target == null) {
    options.target = '/etc/my.cnf';
  }
  return this.file.ini({
    stringify: misc.ini.stringify_single_key
  }, options);
};

// ## Dependencies
misc = require('@nikitajs/core/lib/misc');
