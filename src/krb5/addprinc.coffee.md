
# `krb5_principal(options, callback)`

Create a new Kerberos principal with a password or an optional keytab.

## Options

*   `kadmin_server`
    Address of the kadmin server; optional, use "kadmin.local" if missing.
*   `kadmin_principal`
    KAdmin principal name unless `kadmin.local` is used.
*   `kadmin_password`
    Password associated to the KAdmin principal.
*   `principal`
    Principal to be created.
*   `password`
    Password associated to this principal; required if no randkey is
    provided.
*   `password_sync`   
    Wether the password should be created if the principal already exists,
    default to "false".   
*   `randkey`
    Generate a random key; required if no password is provided.
*   `keytab`
    Path to the file storing key entries.
*   `log`
    Function called with a log related messages.
*   `ssh` (object|ssh2)
    Run the action on a remote server using SSH, an ssh2 instance or an
    configuration object used to initialize the SSH connection.
*   `stdout` (stream.Writable)
    Writable EventEmitter in which the standard output of executed commands will
    be piped.
*   `stderr` (stream.Writable)
    Writable EventEmitter in which the standard error output of executed command
    will be piped.

## Keytab example

```js
require('mecano').krb5_addprinc({
  principal: 'myservice/my.fqdn@MY.REALM',
  randkey: true,
  keytab: '/etc/security/keytabs/my.service.keytab',
  uid: 'myservice',
  gid: 'myservice',
  kadmin_principal: 'me/admin@MY_REALM',
  kadmin_password: 'pass',
  kadmin_server: 'localhost'
}, function(err, modified){
  console.log(err ? err.message : 'Principal created or modified: ' + !!modified);
});
```

## Source Code

    module.exports = (options, callback) ->
      return callback new Error 'Property principal is required' unless options.principal
      return callback new Error 'Password or randkey missing' if not options.password and not options.randkey
      # Normalize realm and principal for later usage of options
      options.realm ?= options.kadmin_principal.split('@')[1] if /.*@.*/.test options.kadmin_principal
      options.principal = "#{options.principal}@#{options.realm}" unless /^\S+@\S+$/.test options.principal
      options.password_sync ?= false
      # Prepare commands
      cmd_getprinc = misc.kadmin options, "getprinc #{options.principal}"
      cmd_addprinc = misc.kadmin options, if options.password
      then "addprinc -pw #{options.password} #{options.principal}"
      else "addprinc -randkey #{options.principal}"
      # todo, could be removed once actions acception multiple options arguments
      # such ash `.krb5_ktadd options, if: options.keytab
      ktadd_options = {}
      for k, v of options then ktadd_options[k] = v
      ktadd_options.if = options.keytab
      @
      .execute
        cmd: cmd_addprinc
        not_if_exec: "#{cmd_getprinc} | grep '#{options.principal}'"
      .execute
        cmd: misc.kadmin options, "cpw -pw #{options.password} #{options.principal}"
        if: options.password and options.password_sync
        not_if_exec: "echo #{options.password} | kinit '#{options.principal}'; kestroy"
      .krb5_ktadd ktadd_options
      .then callback

## Dependencies

    misc = require '../misc'