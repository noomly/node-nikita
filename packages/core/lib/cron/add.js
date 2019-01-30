// Generated by CoffeeScript 2.3.2
// # `nikita.cron.add`

// Register a job on crontab.

// ## Options

// * `user` (name | uid)   
//   the user of the crontab. the SSH user by default   
// * `match` (null | string | regexp).   
//   The cron entry to match, a string will be converted to a regexp and an
//   undefined or null value will match the exact command.   
// * `when` (string)   
//   cron-styled time string. Defines the frequency of the cron job.   
// * `cmd`   
//   the shell command of the job   
// * `exec`   
//   if true, then cmd will be executed just after if added to crontab   
// * `log`   
//   Function called with a log related messages.   
// * `ssh` (object|ssh2)   
//   Run the action on a remote server using SSH, an ssh2 instance or an
//   configuration object used to initialize the SSH connection.   
// * `stdout` (stream.Writable)   
//   Writable EventEmitter in which the standard output of executed commands will
//   be piped.   
// * `stderr` (stream.Writable)   
//   Writable EventEmitter in which the standard error output of executed command
//   will be piped.   

// ## Example

// ```js
// require('nikita').cron.add({
//   cmd: 'kinit service/my.fqdn@MY.REALM -kt /etc/security/service.keytab',
//   when: '0 */9 * * *'
//   user: 'service'
// }, function(err, status){
//   console.log(err ? err.message : 'Cron entry created or modified: ' + status);
// });
// ```

// ## Source Code
var diff, regexp, string, util, wrap;

module.exports = function({options}, callback) {
  var crontab, jobs;
  if (!(options.when && typeof options.when === 'string')) {
    return callback(Error('valid when is required'));
  }
  if (!options.cmd) {
    return callback(Error('valid cmd is required'));
  }
  if (options.user != null) {
    this.log({
      message: `Using user ${options.user}`,
      level: 'DEBUG',
      module: 'nikita/cron/add'
    });
    crontab = `crontab -u ${options.user}`;
  } else {
    this.log({
      message: "Using default user",
      level: 'DEBUG',
      module: 'nikita/cron/add'
    });
    crontab = "crontab";
  }
  jobs = null;
  return this.system.execute({
    cmd: `${crontab} -l`,
    code: [0, 1]
  }, function(err, {stdout, stderr}) {
    var added, i, job, modified, new_job, regex;
    if (err && !/^no crontab for/.test(stderr)) {
      throw err;
    }
    // throw Error 'User crontab not found' if /^no crontab for/.test stderr
    new_job = `${options.when} ${options.cmd}`;
    // remove useless last element
    regex = (function() {
      if (!options.match) {
        return new RegExp(`.* ${regexp.escape(options.cmd)}`);
      } else if (typeof options.match === 'string') {
        return new RegExp(options.match);
      } else if (util.isRegExp(options.match)) {
        return options.match;
      } else {
        throw Error("Invalid option 'match'");
      }
    })();
    added = true;
    jobs = (function() {
      var j, len, ref, results;
      ref = string.lines(stdout.trim());
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        job = ref[i];
        if (regex.test(job)) {
          added = false;
          if (job === new_job) { // Found job, stop here
            break;
          }
          this.log({
            message: "Entry has changed",
            level: 'WARN',
            module: 'nikita/cron/add'
          });
          diff(job, new_job, options);
          job = new_job;
          modified = true;
        }
        results.push(job);
      }
      return results;
    }).call(this);
    if (added) {
      jobs.push(new_job);
      this.log({
        message: "Job not found in crontab, adding",
        level: 'WARN',
        module: 'nikita/cron/add'
      });
    }
    if (!(added || modified)) {
      return jobs = null;
    }
  }).next(function(err) {
    if (err) {
      return callback(err);
    }
    if (!jobs) {
      return callback();
    }
    this.system.execute({
      cmd: options.user != null ? `su -l ${options.user} -c '${options.cmd}'` : options.cmd,
      if: options.exec
    });
    return this.system.execute({
      cmd: `${crontab} - <<EOF\n${jobs.join('\n')}\nEOF`
    }).next(callback);
  });
};

// ## Dependencies
util = require('util');

({regexp} = require('../misc'));

diff = require('../misc/diff');

string = require('../misc/string');

wrap = require('../misc/wrap');