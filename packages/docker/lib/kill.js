// Generated by CoffeeScript 2.3.2
// # `nikita.docker.kill`

// Send signal to containers using SIGKILL or a specified signal.
// Note if container is not running , SIGKILL is not executed and
// return status is UNMODIFIED. If container does not exist nor is running
// SIGNAL is not sent.

// ## Options

// * `boot2docker` (boolean)   
//   Whether to use boot2docker or not, default to false.
// * `container` (string)   
//   Name/ID of the container, required.   
// * `machine` (string)   
//   Name of the docker-machine, required if using docker-machine.
// * `signal` (int|string)   
//   Use a specified signal. SIGKILL by default.

// ## Callback parameters

// * `err`   
//   Error object if any.
// * `status`   
//   True if container was killed.

// ## Example

// ```javascript
// require('nikita')
// .docker.kill({
//   container: 'toto',
//   signal: 9
// }, function(err, status){  
//   console.log( err ? err.message : 'Container killed: ' + status);
// })
// ```

// ## Source Code
var docker;

module.exports = function({options}) {
  var cmd, k, ref, v;
  this.log({
    message: "Entering Docker kill",
    level: 'DEBUG',
    module: 'nikita/lib/docker/kill'
  });
  // Global options
  if (options.docker == null) {
    options.docker = {};
  }
  ref = options.docker;
  for (k in ref) {
    v = ref[k];
    if (options[k] == null) {
      options[k] = v;
    }
  }
  if (options.container == null) {
    // Validate parameters
    return callback(Error('Missing container parameter'));
  }
  cmd = 'kill';
  if (options.signal != null) {
    cmd += ` -s ${options.signal}`;
  }
  cmd += ` ${options.container}`;
  this.system.execute({
    cmd: docker.wrap(options, `ps | grep '${options.container}' | grep 'Up'`),
    code_skipped: 1
  }, docker.callback);
  return this.system.execute({
    if: function() {
      return this.status(-1);
    },
    cmd: docker.wrap(options, cmd)
  }, docker.callback);
};

// ## Modules Dependencies
docker = require('@nikitajs/core/lib/misc/docker');
