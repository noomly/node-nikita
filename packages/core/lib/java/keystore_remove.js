// Generated by CoffeeScript 2.3.2
// # `nikita.java.keystore_remove`

// Remove certificates, private keys and certificate authorities from java
// keystores and truststores.

// ## Options

// * `name` (string|array)   
//   Alias of the key and the certificate, required if "caname" isn't provided.   
// * `caname` (string|array)   
//   Alias of the certificate authority (CA), required if "name" isn't provided.   
// * `keytool` (boolean, optioanl)   
//   Path to the `keytool` command, detetected from `$PATH` by default.
// * `keystore` (string)   
//   Path to the keystore (doesn't need to exists).   
// * `storepass` (string)   
//   Password to manage the keystore.   

// ## Removing a key and its certificate

// ```js
// require('nikita').java.keystore_remove([{
//   keystore: java_home + '/lib/security/cacerts',
//   storepass: 'changeit',
//   caname: 'my_ca_certificate',
//   keypass: 'mypassword',
//   name: 'node_1'
// }, function(err, status){ /* do sth */ });
// ```

// ## Removing a certificate authority

// ```js
// require('nikita')
// .java.keystore_add([{
//   keystore: java_home + '/lib/security/cacerts',
//   storepass: 'changeit',
//   caname: 'my_ca_certificate'
// }, function(err, status){ /* do sth */ });
// ```
// ## Source Code
module.exports = function({options}) {
  var aliases;
  if (!options.keystore) {
    throw Error("Required option 'keystore'");
  }
  if (!options.storepass) {
    throw Error("Required option 'storepass'");
  }
  if (!(options.name || options.caname)) {
    throw Error("Required option 'name' or 'caname'");
  }
  if (!Array.isArray(options.caname)) {
    options.caname = [options.caname];
  }
  if (!Array.isArray(options.name)) {
    options.name = [options.name];
  }
  aliases = [...options.caname, ...options.name].join(' ').trim();
  if (options.keytool == null) {
    options.keytool = 'keytool';
  }
  return this.system.execute({
    bash: true,
    cmd: `# Detect keytool command\nkeytoolbin=${options.keytool}\ncommand -v $keytoolbin >/dev/null || {\n  if [ -x /usr/java/default/bin/keytool ]; then keytoolbin='/usr/java/default/bin/keytool';\n  else exit 7; fi\n}\ntest -f "${options.keystore}" || # Nothing to do if not a file\nexit 3\ncount=0\nfor alias in ${aliases}; do\n  if \${keytoolbin} -list -keystore "${options.keystore}" -storepass "${options.storepass}" -alias "$alias"; then\n     \${keytoolbin} -delete -keystore "${options.keystore}" -storepass "${options.storepass}" -alias "$alias"\n     (( count++ ))\n  fi\ndone\n[ $count -eq 0 ] && exit 3\nexit 0`,
    code_skipped: 3
  });
};
