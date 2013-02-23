// Generated by CoffeeScript 1.4.0
var conditions, each, eco, exec, fs, mecano, misc, open, path, rimraf, util, _ref;

fs = require('fs');

path = require('path');

if ((_ref = fs.exists) == null) {
  fs.exists = path.exists;
}

util = require('util');

each = require('each');

eco = require('eco');

rimraf = require('rimraf');

open = require('open-uri');

exec = require('superexec');

conditions = require('./conditions');

misc = require('./misc');

/*

Mecano gather a set of functions usually used during system deployment. All the functions share a 
common API with flexible options.
*/


mecano = module.exports = {
  /*
  
    `cp` `copy(options, callback)`
    ------------------------------
  
    Copy a file. The behavior is similar to the one of the `cp` 
    Unix utility. Copying a file over an existing file will 
    overwrite it.
  
    `options`         Command options include:   
  
    *   `source`      The file or directory to copy.
    *   `destination`     Where the file or directory is copied.
    *   `not_if_exists`   Equals destination if true.
    *   `chmod`       Permissions of the file or the parent directory
  
    `callback`        Received parameters are:   
  
    *   `err`         Error object if any.   
    *   `copied`      Number of files or parent directories copied.
  
    todo:
    *   preserve permissions if `chmod` is `true`
  */

  copy: function(options, callback) {
    var copied;
    options = misc.options(options);
    copied = 0;
    return each(options).on('item', function(options, next) {
      var search;
      if (!options.source) {
        return next(new Error('Missing source'));
      }
      if (!options.destination) {
        return next(new Error('Missing destination'));
      }
      if (options.not_if_exists === true) {
        options.not_if_exists = options.destination;
      }
      search = function() {
        var chmod, copy, copyDir, copyFile, directory, dstStat, finish, srcStat;
        srcStat = null;
        dstStat = null;
        fs.stat(options.source, function(err, stat) {
          if (err) {
            return next(err);
          }
          srcStat = stat;
          return fs.stat(options.destination, function(err, stat) {
            var sourceEndWithSlash;
            dstStat = stat;
            sourceEndWithSlash = options.source.lastIndexOf('/') === options.source.length - 1;
            if (srcStat.isDirectory() && dstStat && !sourceEndWithSlash) {
              options.destination = path.resolve(options.destination, path.basename(options.source));
            }
            if (srcStat.isDirectory()) {
              return directory(options.source);
            } else {
              return copy(options.source, next);
            }
          });
        });
        directory = function(dir) {
          return each().files("" + dir + "/**").on('item', function(file, next) {
            return copy(file, next);
          }).on('both', next);
        };
        copy = function(source, next) {
          var destination;
          if (srcStat.isDirectory()) {
            destination = path.resolve(options.destination, path.relative(options.source, source));
          } else if (!srcStat.isDirectory() && (dstStat != null ? dstStat.isDirectory() : void 0)) {
            destination = path.resolve(options.destination, path.basename(source));
          } else {
            destination = options.destination;
          }
          return fs.stat(source, function(err, stat) {
            if (stat.isDirectory()) {
              return copyDir(source, destination, next);
            } else {
              return copyFile(source, destination, next);
            }
          });
        };
        copyDir = function(source, destination, next) {
          if (source === options.source) {
            return next();
          }
          return fs.mkdir(destination, function(err) {
            if ((err != null ? err.code : void 0) === 'EEXIST') {
              return next();
            }
            if (err) {
              return next(err);
            }
            return finish(next);
          });
        };
        copyFile = function(source, destination, next) {
          return misc.file.compare([source, destination], function(err, md5) {
            var input, output;
            if (err && err.message.indexOf('Does not exist') !== 0) {
              return next(err);
            }
            if (md5) {
              return next();
            }
            input = fs.createReadStream(source);
            output = fs.createWriteStream(destination);
            return input.pipe(output).on('close', function(err) {
              if (err) {
                return next(err);
              }
              return chmod(source, next);
            });
          });
        };
        chmod = function(file, next) {
          if (!options.chmod || options.chmod === dstStat.mode) {
            return finish(next);
          }
          return fs.chmod(options.destination, options.chmod, function(err) {
            if (err) {
              return next(err);
            }
            return finish(next);
          });
        };
        return finish = function(next) {
          copied++;
          return next();
        };
      };
      return conditions.all(options, next, search);
    }).on('both', function(err) {
      return callback(err, copied);
    });
  },
  /*
  
    `download(options, callback)`
    -----------------------------
  
    Download files using various protocols. The excellent 
    [open-uri](https://github.com/publicclass/open-uri) module provides support for HTTP(S), 
    file and FTP. All the options supported by open-uri are passed to it.
  
    Note, GIT is not yet supported but documented as a wished feature.
  
    `options`         Command options include:   
  
    *   `source`      File, HTTP URL, FTP, GIT repository. File is the default protocol if source is provided without a scheme.   
    *   `destination` Path where the file is downloaded.   
    *   `force`       Overwrite destination file if it exists.   
  
    `callback`        Received parameters are:   
  
    *   `err`         Error object if any.   
    *   `downloaded`  Number of downloaded files
  
    Basic example:
        mecano.download
          source: 'https://github.com/wdavidw/node-sigar/tarball/v0.0.1'
          destination: 'node-sigar.tgz'
        , (err, downloaded) ->
          fs.exists 'node-sigar.tgz', (exists) ->
            assert.ok exists
  */

  download: function(options, callback) {
    var downloaded;
    options = misc.options(options);
    downloaded = 0;
    return each(options).on('item', function(options, next) {
      var download, prepare, _ref1;
      if (!options.source) {
        return next(new Error("Missing source: " + options.source));
      }
      if (!options.destination) {
        return next(new Error("Missing destination: " + options.destination));
      }
      if ((_ref1 = options.force) == null) {
        options.force = false;
      }
      prepare = function() {
        return fs.exists(options.destination, function(exists) {
          if (exists && !options.force) {
            return next();
          } else if (exists) {
            return rimraf(options.destination, function(err) {
              if (err) {
                return next(err);
              }
              return download();
            });
          } else {
            return download();
          }
        });
      };
      download = function() {
        var destination;
        destination = fs.createWriteStream(options.destination);
        open(options.source, destination);
        destination.on('close', function() {
          downloaded++;
          return next();
        });
        return destination.on('error', function(err) {
          return mecano.remove(destination, function(err) {
            return next(err);
          });
        });
      };
      return prepare();
    }).on('both', function(err) {
      return callback(err, downloaded);
    });
  },
  /*
  
    `exec` `execute([goptions], options, callback)`
    -----------------------------------------------
    Run a command locally or with ssh if the `host` is provided. Global options is
    optional and is used in case where options is defined as an array of 
    multiple commands. Note, `opts` inherites all the properties of `goptions`.
  
    `goptions`        Global options includes:
  
    *   `parallel`    Wether the command are run in sequential, parallel 
    or limited concurrent mode. See the `node-each` documentation for more 
    details. Default to sequential (false).
          
    `options`         Include all conditions as well as:  
  
    *   `ssh`         SSH connection options or an ssh2 instance
    *   `cmd`         String, Object or array; Command to execute.   
    *   `env`         Environment variables, default to `process.env`.   
    *   `cwd`         Current working directory.   
    *   `uid`         Unix user id.   
    *   `gid`         Unix group id.   
    *   `code`        Expected code(s) returned by the command, int or array of int, default to 0.   
    *   `host`        SSH host or IP address.   
    *   `username`    SSH host or IP address.   
    *   `stdout`      Writable EventEmitter in which command output will be piped.   
    *   `stderr`      Writable EventEmitter in which command error will be piped.   
  
    `callback`        Received parameters are:   
  
    *   `err`         Error if any.   
    *   `executed`    Number of executed commandes.   
    *   `stdout`      Stdout value(s) unless `stdout` option is provided.   
    *   `stderr`      Stderr value(s) unless `stderr` option is provided.
  */

  execute: function(goptions, options, callback) {
    var escape, executed, isArray, stderrs, stdouts;
    if (arguments.length === 2) {
      callback = options;
      options = goptions;
    }
    isArray = Array.isArray(options);
    options = misc.options(options);
    executed = 0;
    stdouts = [];
    stderrs = [];
    escape = function(cmd) {
      var char, esccmd, _i, _len;
      esccmd = '';
      for (_i = 0, _len = cmd.length; _i < _len; _i++) {
        char = cmd[_i];
        if (char === '$') {
          esccmd += '\\';
        }
        esccmd += char;
      }
      return esccmd;
    };
    return each(options).parallel(goptions.parallel).on('item', function(options, i, next) {
      var cmd, _ref1;
      if (typeof options === 'string') {
        options = {
          cmd: options
        };
      }
      misc.merge(true, options, goptions);
      if (options.cmd == null) {
        return next(new Error("Missing cmd: " + options.cmd));
      }
      if ((_ref1 = options.code) == null) {
        options.code = [0];
      }
      if (!Array.isArray(options.code)) {
        options.code = [options.code];
      }
      cmd = function() {
        var run, stderr, stdout;
        run = exec(options);
        stdout = stderr = '';
        if (options.stdout) {
          run.stdout.pipe(options.stdout);
        } else {
          run.stdout.on('data', function(data) {
            return stdout += data;
          });
        }
        if (options.stderr) {
          run.stderr.pipe(options.stderr);
        } else {
          run.stderr.on('data', function(data) {
            return stderr += data;
          });
        }
        return run.on("exit", function(code) {
          return setTimeout(function() {
            var err;
            executed++;
            stdouts.push(options.stdout ? void 0 : stdout);
            stderrs.push(options.stderr ? void 0 : stderr);
            if (options.code.indexOf(code) === -1) {
              err = new Error("Invalid exec code " + code);
              err.code = code;
              return next(err);
            }
            return next();
          }, 1);
        });
      };
      return conditions.all(options, next, cmd);
    }).on('both', function(err) {
      if (!isArray) {
        stdouts = stdouts[0];
      }
      if (!isArray) {
        stderrs = stderrs[0];
      }
      return callback(err, executed, stdouts, stderrs);
    });
  },
  /*
  
    `extract(options, callback)` 
    ----------------------------
  
    Extract an archive. Multiple compression types are supported. Unless 
    specified as an option, format is derived from the source extension. At the 
    moment, supported extensions are '.tgz', '.tar.gz' and '.zip'.   
  
    `options`             Command options include:   
  
    *   `source`          Archive to decompress.   
    *   `destination`     Default to the source parent directory.   
    *   `format`          One of 'tgz' or 'zip'.   
    *   `creates`         Ensure the given file is created or an error is send in the callback.   
    *   `not_if_exists`   Cancel extraction if file exists.   
  
    `callback`            Received parameters are:   
  
    *   `err`             Error object if any.   
    *   `extracted`       Number of extracted archives.
  */

  extract: function(options, callback) {
    var extracted;
    options = misc.options(options);
    extracted = 0;
    return each(options).on('item', function(options, next) {
      var creates, destination, ext, extract, format, success, _ref1;
      if (!options.source) {
        return next(new Error("Missing source: " + options.source));
      }
      destination = (_ref1 = options.destination) != null ? _ref1 : path.dirname(options.source);
      if (options.format != null) {
        format = options.format;
      } else {
        if (/\.(tar\.gz|tgz)$/.test(options.source)) {
          format = 'tgz';
        } else if (/\.zip$/.test(options.source)) {
          format = 'zip';
        } else {
          ext = path.extname(options.source);
          return next(new Error("Unsupported extension, got " + (JSON.stringify(ext))));
        }
      }
      extract = function() {
        var cmd;
        cmd = null;
        switch (format) {
          case 'tgz':
            cmd = "tar xzf " + options.source + " -C " + destination;
            break;
          case 'zip':
            cmd = "unzip -u " + options.source + " -d " + destination;
        }
        options.cmd = cmd;
        return exec(options, function(err, stdout, stderr) {
          if (err) {
            return next(err);
          }
          return creates();
        });
      };
      creates = function() {
        if (options.creates == null) {
          return success();
        }
        return fs.exists(options.creates, function(exists) {
          if (!exists) {
            return next(new Error("Failed to create '" + (path.basename(options.creates)) + "'"));
          }
          return success();
        });
      };
      success = function() {
        extracted++;
        return next();
      };
      if (typeof options.should_exist === 'undefined') {
        options.should_exist = options.source;
      }
      return conditions.all(options, next, extract);
    }).on('both', function(err) {
      return callback(err, extracted);
    });
  },
  /*
    
    `git`
    -----
  
    `options`             Command options include:   
  
    *   `ssh`             SSH connection options or an ssh2 instance
    *   `source`          Git source repository address.
    *   `destination`     Directory where to clone the repository.
    *   `revision`        Git revision, branch or tag.
  */

  git: function(options, callback) {
    var updated;
    options = misc.options(options);
    updated = 0;
    return each(options).on('item', function(options, next) {
      var checkout, clone, log, prepare, rev, _ref1;
      if ((_ref1 = options.revision) == null) {
        options.revision = 'HEAD';
      }
      rev = null;
      prepare = function() {
        return fs.stat(options.destination, function(err, stat) {
          var gitDir;
          if (err && err.code === 'ENOENT') {
            return clone();
          }
          if (!stat.isDirectory()) {
            return next(new Error("Destination not a directory, got " + options.destination));
          }
          gitDir = "" + options.destination + "/.git";
          return fs.stat(gitDir, function(err, stat) {
            if (err || !stat.isDirectory()) {
              return next(err);
            }
            return log();
          });
        });
      };
      clone = function() {
        return mecano.exec({
          ssh: options.ssh,
          cmd: "git clone " + options.source + " " + options.destination,
          cwd: path.dirname(options.destination)
        }, function(err, executed, stdout, stderr) {
          if (err) {
            return next(err);
          }
          return checkout();
        });
      };
      log = function() {
        return mecano.exec({
          ssh: options.ssh,
          cmd: "git log --pretty=format:'%H' -n 1",
          cwd: options.destination
        }, function(err, executed, stdout, stderr) {
          var current;
          if (err) {
            return next(err);
          }
          current = stdout.trim();
          return mecano.exec({
            ssh: options.ssh,
            cmd: "git rev-list --max-count=1 " + options.revision,
            cwd: options.destination
          }, function(err, executed, stdout, stderr) {
            if (err) {
              return next(err);
            }
            if (stdout.trim() !== current) {
              return checkout();
            } else {
              return next();
            }
          });
        });
      };
      checkout = function() {
        return mecano.exec({
          ssh: options.ssh,
          cmd: "git checkout " + options.revision,
          cwd: options.destination
        }, function(err) {
          if (err) {
            return next(err);
          }
          updated++;
          return next();
        });
      };
      return conditions.all(options, next, prepare);
    }).on('both', function(err) {
      return callback(err, updated);
    });
  },
  /*
  
    `ln` `link(options, callback)`
    ------------------------------
    Create a symbolic link and it's parent directories if they don't yet
    exist.
  
    `options`             Command options include:   
  
    *   `source`          Referenced file to be linked.   
    *   `destination`     Symbolic link to be created.   
    *   `exec`            Create an executable file with an `exec` command.   
    *   `chmod`           Default to 0755.   
  
    `callback`            Received parameters are:   
  
    *   `err`             Error object if any.   
    *   `linked`          Number of created links.
  */

  link: function(options, callback) {
    var exec_create, exec_exists, linked, option, parents, sym_create, sym_exists;
    options = misc.options(options);
    linked = 0;
    sym_exists = function(option, callback) {
      return fs.exists(option.destination, function(exists) {
        if (!exists) {
          return callback(null, false);
        }
        return fs.readlink(option.destination, function(err, resolvedPath) {
          if (err) {
            return callback(err);
          }
          if (resolvedPath === option.source) {
            return callback(null, true);
          }
          return fs.unlink(option.destination, function(err) {
            if (err) {
              return callback(err);
            }
            return callback(null, false);
          });
        });
      });
    };
    sym_create = function(option, callback) {
      return fs.symlink(option.source, option.destination, function(err) {
        if (err) {
          return callback(err);
        }
        linked++;
        return callback();
      });
    };
    exec_exists = function(option, callback) {
      return fs.exists(option.destination, function(exists) {
        if (!exists) {
          return callback(null, false);
        }
        return fs.readFile(option.destination, 'ascii', function(err, content) {
          var exec_cmd;
          if (err) {
            return callback(err);
          }
          exec_cmd = /exec (.*) \$@/.exec(content)[1];
          return callback(null, exec_cmd && exec_cmd === option.source);
        });
      });
    };
    exec_create = function(option, callback) {
      var content;
      content = "#!/bin/bash\nexec " + option.source + " $@";
      return fs.writeFile(option.destination, content, function(err) {
        if (err) {
          return callback(err);
        }
        return fs.chmod(option.destination, option.chmod, function(err) {
          if (err) {
            return callback(err);
          }
          linked++;
          return callback();
        });
      });
    };
    parents = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        _results.push(path.normalize(path.dirname(option.destination)));
      }
      return _results;
    })();
    return mecano.mkdir(parents, function(err, created) {
      if (err) {
        return callback(err);
      }
      return each(options).parallel(true).on('item', function(option, next) {
        var dispatch, _ref1;
        if (!option.source) {
          return next(new Error("Missing source, got " + (JSON.stringify(option.source))));
        }
        if (!option.destination) {
          return next(new Error("Missing destination, got " + (JSON.stringify(option.destination))));
        }
        if ((_ref1 = option.chmod) == null) {
          option.chmod = 0x1ed;
        }
        dispatch = function() {
          if (option.exec) {
            return exec_exists(option, function(err, exists) {
              if (exists) {
                return next();
              }
              return exec_create(option, next);
            });
          } else {
            return sym_exists(option, function(err, exists) {
              if (exists) {
                return next();
              }
              return sym_create(option, next);
            });
          }
        };
        return dispatch();
      }).on('both', function(err) {
        return callback(err, linked);
      });
    });
  },
  /*
  
    `mkdir(options, callback)`
    --------------------------
  
    Recursively create a directory. The behavior is similar to the Unix command `mkdir -p`. 
    It supports an alternative syntax where options is simply the path of the directory
    to create.
  
    `options`           Command options include:   
  
    *   `source`        Path or array of paths.   
    *   `directory`     Alias for `source`
    *   `exclude`       Regular expression.   
    *   `chmod`         Default to 0755.  
    *   `cwd`           Current working directory for relative paths.   
  
    `callback`          Received parameters are:   
  
    *   `err`           Error object if any.   
    *   `created`       Number of created directories
  
    Simple usage:
  
        mecano.mkdir './some/dir', (err, created) ->
          console.log err?.message ? created
  */

  mkdir: function(options, callback) {
    var created;
    options = misc.options(options);
    created = 0;
    return each(options).on('item', function(option, next) {
      var check, create, cwd, _ref1;
      if (typeof option === 'string') {
        option = {
          source: option
        };
      }
      if (!(option.source != null) && (option.directory != null)) {
        option.source = option.directory;
      }
      cwd = (_ref1 = option.cwd) != null ? _ref1 : process.cwd();
      option.source = path.resolve(cwd, option.source);
      if (option.source == null) {
        return next(new Error('Missing source option'));
      }
      check = function() {
        return fs.stat(option.source, function(err, stat) {
          if (err && err.code === 'ENOENT') {
            return create();
          }
          if (err) {
            return next(err);
          }
          if (stat.isDirectory()) {
            return next();
          }
          return next(err('Invalid source, got #{JSON.encode(option.source)}'));
        });
      };
      create = function() {
        var current, dirCreated, dirs, _ref2;
        if ((_ref2 = option.chmod) == null) {
          option.chmod = 0x1ed;
        }
        current = '';
        dirCreated = false;
        dirs = option.source.split('/');
        return each(dirs).on('item', function(dir, next) {
          if ((option.exclude != null) && option.exclude instanceof RegExp) {
            if (option.exclude.test(dir)) {
              return next();
            }
          }
          current += "/" + dir;
          return fs.exists(current, function(exists) {
            if (exists) {
              return next();
            }
            return fs.mkdir(current, option.chmod, function(err) {
              if (err) {
                return next(err);
              }
              dirCreated = true;
              return next();
            });
          });
        }).on('both', function(err) {
          if (dirCreated) {
            created++;
          }
          return next(err);
        });
      };
      return check();
    }).on('both', function(err) {
      return callback(err, created);
    });
  },
  /*
  
    `mv` `move(options, callback)`
    --------------------------------
  
    More files and directories.
  
    `options`         Command options include:   
  
    *   `source`      File or directory to move.  
    *   `destination` Final name of the moved resource.    
  
    `callback`        Received parameters are:   
  
    *   `err`         Error object if any.   
    *   `moved`        Number of moved resources.
  
    Example
  
      mecano.mv
        source: __dirname
        desination: '/temp/my_dir'
      , (err, moved) ->
        console.log "#{moved} dir moved"
  */

  move: function(options, callback) {
    var moved;
    options = misc.options(options);
    moved = 0;
    return each(options).on('item', function(options, next) {
      return fs.rename(options.source, options.destination, function(err) {
        if (err) {
          return next(err);
        }
        moved++;
        return next();
      });
    }).on('both', function(err) {
      return callback(err, moved);
    });
  },
  /*
  
    `rm` `remove(options, callback)`
    --------------------------------
  
    Recursively remove files, directories and links. Internally, the function 
    use the [rimraf](https://github.com/isaacs/rimraf) library.
  
    `options`         Command options include:   
  
    *   `source`      File, directory or pattern.   
  
    `callback`        Received parameters are:   
  
    *   `err`         Error object if any.   
    *   `deleted`     Number of deleted sources.   
  
    Example
  
        mecano.rm './some/dir', (err, removed) ->
          console.log "#{removed} dir removed"
    
    Removing a directory unless a given file exists
  
        mecano.rm
          source: './some/dir'
          not_if_exists: './some/file'
        , (err, removed) ->
          console.log "#{removed} dir removed"
    
    Removing multiple files and directories
  
        mecano.rm [
          { source: './some/dir', not_if_exists: './some/file' }
          './some/file'
        ], (err, removed) ->
          console.log "#{removed} dirs removed"
  */

  remove: function(options, callback) {
    var deleted;
    options = misc.options(options);
    deleted = 0;
    return each(options).on('item', function(options, next) {
      var _ref1;
      if (typeof options === 'string') {
        options = {
          source: options
        };
      }
      if (options.source == null) {
        return next(new Error('Missing source: #{option.source}'));
      }
      if ((_ref1 = options.options) == null) {
        options.options = {};
      }
      return each().files(options.source).on('item', function(file, next) {
        deleted++;
        return rimraf(file, next);
      }).on('error', function(err) {
        return next(err);
      }).on('end', function() {
        return next();
      });
    }).on('both', function(err) {
      return callback(err, deleted);
    });
  },
  /*
  
    `render(options, callback)`
    ---------------------------
    
    Render a template file At the moment, only the 
    [ECO](http://github.com/sstephenson/eco) templating engine is integrated.   
    
    `options`           Command options include:   
    
    *   `engine`        Template engine to use, default to "eco"   
    *   `content`       Templated content, bypassed if source is provided.   
    *   `source`        File path where to extract content from.   
    *   `destination`   File path where to write content to or a callback.   
    *   `context`       Map of key values to inject into the template.
  
    `callback`          Received parameters are:   
    
    *   `err`           Error object if any.   
    *   `rendered`      Number of rendered files.   
  
    If destination is a callback, it will be called multiple times with the   
    generated content as its first argument.
  */

  render: function(options, callback) {
    var rendered;
    options = misc.options(options);
    rendered = 0;
    return each(options).on('item', function(option, next) {
      var readSource, writeContent;
      if (!(option.source || option.content)) {
        return next(new Error('Missing source or content'));
      }
      if (!option.destination) {
        return next(new Error('Missing destination'));
      }
      readSource = function() {
        if (!option.source) {
          return writeContent();
        }
        return fs.exists(option.source, function(exists) {
          if (!exists) {
            return next(new Error("Invalid source, got " + (JSON.stringify(option.source))));
          }
          return fs.readFile(option.source, function(err, content) {
            if (err) {
              return next(err);
            }
            option.content = content;
            return writeContent();
          });
        });
      };
      writeContent = function() {
        return mecano.write(option, function(err, written) {
          if (err) {
            return next(err);
          }
          if (written) {
            rendered++;
          }
          return next();
        });
      };
      return readSource();
    }).on('both', function(err) {
      return callback(err, rendered);
    });
  },
  /*
    `write(options, callback)`
    --------------------------
  
    Write a file or a portion of an existing file.
    
    `options`           Command options include:   
    
    *   `from`          Replace from after this marker, a string or a regular expression matching a line
    *   `to`            Replace to before this marker, a string or a regular expression matching a line
    *   `content`       Text to be written.
    *   `destination`   File path where to write content to.
  
    `callback`          Received parameters are:   
    
    *   `err`           Error object if any.   
    *   `rendered`      Number of rendered files.
  */

  write: function(options, callback) {
    var written;
    options = misc.options(options);
    written = 0;
    return each(options).on('item', function(option, next) {
      var destination, destinationHash, readDestinationContent, writeContent;
      if (!(option.source || option.content)) {
        return next(new Error('Missing source or content'));
      }
      if (!option.destination) {
        return next(new Error('Missing destination'));
      }
      destination = null;
      destinationHash = null;
      readDestinationContent = function() {
        if (typeof option.destination === 'function') {
          return writeContent();
        }
        return fs.exists(option.destination, function(exists) {
          if (!exists) {
            return writeContent();
          }
          return fs.readFile(option.destination, function(err, content) {
            if (err) {
              return next(err);
            }
            destinationHash = misc.string.hash(content);
            return writeContent();
          });
        });
      };
      writeContent = function() {
        var content;
        try {
          content = eco.render(option.content.toString(), option.context || {});
        } catch (err) {
          return next(err);
        }
        if (destinationHash === misc.string.hash(content)) {
          return next();
        }
        if (typeof option.destination === 'function') {
          option.destination(content);
          return next();
        } else {
          return fs.writeFile(option.destination, content, function(err) {
            if (err) {
              return next(err);
            }
            written++;
            return next();
          });
        }
      };
      return readDestinationContent();
    }).on('both', function(err) {
      return callback(err, written);
    });
  },
  /*
    `service(options, callback)`
    ----------------------------
  */

  service: function(options, callback) {
    var written;
    options = misc.options(options);
    written = 0;
    return each(options).on('item', function(option, next) {
      if (!option.name) {
        return next(new Error('Missing service name'));
      }
    }).on('both', function(err) {
      return callback(err, written);
    });
  }
};

mecano.cp = mecano.copy;

mecano.exec = mecano.execute;

mecano.ln = mecano.link;

mecano.mv = mecano.move;

mecano.rm = mecano.remove;