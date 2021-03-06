// Generated by CoffeeScript 2.3.2
// # `nikita.lxd.start`

// Start containers.

// ## Options

// * `name` (string, required)
//   The name of the container.

// ## Callback Parameters

// * `err`
//   Error object if any.
// * `info.status`
//   Was the container started or already running.

// ## Example

// ```
// require('nikita')
// .lxd.start({
//   name: "my_container"
// }, function(err, {status}) {
//   console.log( err ? err.message : 
//     status ? 'Container now running' : 'Container already running' )
// });
// ```

// ## Source Code
module.exports = function({options}) {
  var cmd_init;
  this.log({
    message: "Entering lxd.init",
    level: 'DEBUG',
    module: '@nikitajs/lxd/lib/init'
  });
  if (!options.name) {
    throw Error("Invalid Option: name is required");
  }
  cmd_init = ['lxc', 'start', options.name].join(' ');
  // Execution
  return this.system.execute({
    name: options.name,
    cmd: `lxc list -c ns --format csv | grep '${options.name},RUNNING' && exit 42 \n${cmd_init}`,
    code_skipped: 42
  });
};
