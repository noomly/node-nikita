
# `ldap_add(options, [goptions], callback`

Insert or modify an entry inside an OpenLDAP server.   

## Options

*   `entry` (object | array)   
    Object to be inserted or modified.   
*   `url`   
    Specify URI referring to the ldap server.   
*   `binddn`   
    Distinguished Name to bind to the LDAP directory.   
*   `passwd`   
    Password for simple authentication.   
*   `name`   
    Distinguish name storing the "olcAccess" property, using the database adress
    (eg: "olcDatabase={2}bdb,cn=config").   
*   `overwrite`   
    Overwrite existing "olcAccess", default is to merge.   

## Example

```js
require('mecano').ldap_index({
  url: 'ldap://openldap.server/',
  binddn: 'cn=admin,cn=config',
  passwd: 'password',
  entry: {
    dn: 'cn=group1,ou=groups,dc=company,dc=com'
    cn: 'group1'
    objectClass: 'top'
    objectClass: 'posixGroup'
    gidNumber: 9601
  }
}, function(err, modified){
  console.log(err ? err.message : "Entry modified: " + !!modified);
});
```

    module.exports = ->
      wrap arguments, (options, next) ->
        modified = false
        return next Error "Mecano `ldap_add`: required property 'entry'" unless options.entry
        options.entry = [options.entry] unless Array.isArray options.entry
        ldif = ''
        for entry in options.entry
          return next Error "Mecano `ldap_add`: required property 'dn'" unless entry.dn
          ldif += '\n'
          ldif += "dn: #{entry.dn}\n"
          [_, k, v] = /^(.*?)=(.+?),.*$/.exec entry.dn
          ldif += "#{k}: #{v}\n"
          for k, v of entry
            continue if k is 'dn'
            v = [v] unless Array.isArray v
            for vv in v
              ldif += "#{k}: #{vv}\n"
        execute
          cmd: """
          ldapadd -c -H #{options.url} \
            -D #{options.binddn} -w #{options.passwd} \
            <<-EOF\n#{ldif}\nEOF
          """
          code_skipped: 68
          ssh: options.ssh
          log: options.log
          stdout: options.stdout
          stderr: options.stderr
        , (err, executed, stdout, stderr) ->
          return next err if err
          modified = stderr.match(/Already exists/g)?.length isnt stdout.match(/adding new entry/g).length
          added = modified # For now, we dont modify
          next err, modified, added

## Dependencies

    execute = require './execute'
    wrap = require './misc/wrap'


