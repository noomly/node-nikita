// Generated by CoffeeScript 2.3.2
// # `nikita.file.render`

// Render a template file. More templating engine could be added on demand. The
// following templating engines are l integrated:     

// * [Nunjucks](http://mozilla.github.io/nunjucks/)   
//   ".j2" extension, engine name is "nunjunks"

// ## Options

// * `engine`   
//   Template engine to use, required unless discovered with the target file
//   extension.   
// * `content`   
//   Templated content, bypassed if source is provided.   
// * `source`   
//   File path where to extract content from.   
// * `target`   
//   File path where to write content to or a callback.   
// * `context`   
//   Map of key values to inject into the template.   
// * `filters` (function)   
//   Filter function to extend the nunjucks engine.   
// * `local`   
//   Treat the source as local instead of remote, only apply with "ssh"
//   option.   
// * `skip_empty_lines`   
//   Remove empty lines.   
// * `uid`   
//   File user name or user id.   
// * `gid`   
//   File group name or group id.   
// * `mode`   
//   File mode (permission and sticky bits), default to `0644`, in the form of
//   `{mode: 0o744}` or `{mode: "744"}`.   

// If target is a callback, it will be called with the generated content as
// its first argument.   

// ## Custom Filters

// Nunjucks allow to add custom filters. Nikita provides some custom filters listed below.
// These filters are implemented misc/string. They can be overriden through the filters
// parameters   

// * `isString`   
//   return true if the variable is a string   
// * `isArray`   
//   return true if the variable is an array   
// * `isObject`   
//   return true if the variable is an object. Return false if the variable is an array.   
// * `isEmpty`   
//   return true if the variable is `null`, `undefined`, `''`, `[]`, or `{}`   

// ## Callback parameters

// * `err`   
//   Error object if any.   
// * `status`   
//   Value is true if rendered file was created or modified.   

// ## Rendering with Nunjucks

// ```js
// require('nikita')
// .file.render({
//   source: './some/a_template.j2',
//   target: '/tmp/a_file',
//   context: {
//     username: 'a_user'
//   }
// }, function(err, {status}){
//   console.log(err ? err.message : 'File rendered: ' + status);
// });
// ```

// ## Source Code
var path;

module.exports = function({options}) {
  var extension;
  this.log({
    message: "Entering file.render",
    level: 'DEBUG',
    module: 'nikita/lib/file/render'
  });
  // Validate parameters
  if (options.encoding == null) {
    options.encoding = 'utf8';
  }
  if (!(options.source || options.content)) {
    throw Error('Required option: source or content');
  }
  if (!options.target) {
    throw Error('Required option: target');
  }
  if (!options.context) {
    throw Error('Required option: context');
  }
  // Extension
  if (!options.engine && options.source) {
    extension = path.extname(options.source);
    switch (extension) {
      case '.j2':
        options.engine = 'nunjunks';
        break;
      default:
        throw Error(`Invalid Option: extension '${extension}' is not supported`);
    }
  }
  // Read source
  this.fs.readFile({
    if: options.source,
    ssh: options.local ? false : options.ssh,
    target: options.source,
    encoding: options.encoding
  }, function(err, {data}) {
    if (data != null) {
      options.source = null;
      return options.content = data;
    }
  });
  return this.call(function() {
    return this.file(options);
  });
};

// ## Dependencies
path = require('path');
