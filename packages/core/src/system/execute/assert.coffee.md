
# `nikita.system.execute.assert`

Assert a shell command.

## Options

* `content` (string|buffer, optional)   
  Content to match, optional.
* `cmd` (string, required)   
  String, Object or array; Command to execute.
* `error` (string, optional)   
  The error message to throw if assert failed.
* `not` (boolean, optional)   
  Negates the validation.   
* `trim` (boolean, optional)   
  Trim the actuel and expected content before matching, default is "false".

All options are passed to `system.execute`.

## Assert a command stdout

```javascript
nikita.system.execute.assert({
  cmd: 'echo hello'
  assert: 'hello'
}, function(err){
  console.log(err || 'ok');
});
```

## Source Code

    module.exports = ({options}) ->
      options.trim ?= false
      options.content = options.content.toString() if Buffer.isBuffer options.content
      options.content = options.content.trim() if options.content and options.trim
      # Content is a string or a buffer
      @call
        if: options.content? and (typeof options.content is 'string' or Buffer.isBuffer options.content)
      , ->
        @system.execute options, options.cmd, (err, {stdout}) ->
          throw err if err
          stdout = stdout.trim() if options.trim
          unless options.not
            unless stdout is options.content
              options.error ?= "Invalid content: expect #{JSON.stringify options.content.toString()} and got #{JSON.stringify stdout.toString()}"
              err = Error options.error
          else
            if stdout is options.content
              options.error ?= "Unexpected content: #{JSON.stringify options.content.toString()}"
              err = Error options.error
          throw err if err
      # Content is a regexp
      @call
        if: options.content? and options.content instanceof RegExp
      , ->
        @system.execute options, options.cmd, (err, {stdout}) ->
          throw err if err
          stdout = stdout.trim() if options.trim
          unless options.not
            unless options.content.test stdout 
              options.error ?= "Invalid content match"
              err = Error options.error
          else
            if options.content.test stdout
              options.error ?= "Unexpected content match"
              err = Error options.error
          throw err if err
