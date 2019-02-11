// Generated by CoffeeScript 2.3.2
// # `nikita.lxd.network.delete`

// Delete an existing lxd network.

// ## Options

// * `name` (required, string)
//   The network name

// ## Callback parameters

// * `err`
//   Error object if any
// * `status`
//   True if the network was deleted

// ## Example

// ```js
// require('nikita')
// .lxd.network.delete({
//   name: 'network0'
// }, function(err, {status}){
//   console.log( err ? err.message : 'Network deleted: ' + status);
// })
// ```

// ## Source Code
module.exports = function({options}) {
  var cmd_delete;
  this.log({
    message: "Entering lxd network delete",
    level: "DEBUG",
    module: "@nikitajs/lxd/lib/network/delete"
  });
  if (!options.name) {
    //Check args
    throw Error("Argument 'name' is required to delete a network");
  }
  //Build command
  cmd_delete = ['lxc', 'network', 'delete', options.name].join(' ');
  //Execute
  return this.system.execute({
    cmd: `lxc network list --format csv | grep ${options.name} || exit 42\n${cmd_delete}`,
    code_skipped: 42
  });
};
