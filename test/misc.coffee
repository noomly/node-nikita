
crypto=require 'crypto'
should = require 'should'
mecano = require '../lib/mecano'
misc = if process.env.MECANO_COV then require '../lib-cov/misc' else require '../lib/misc'
test = require './test'
they = require './they'
connect = require 'superexec/lib/connect'

describe 'misc', ->

  scratch = test.scratch @

  describe 'string', ->

    describe 'hash', ->

      it 'returns the string md5', ->
        md5 = misc.string.hash "hello"
        md5.should.eql '5d41402abc4b2a76b9719d911017c592'

  describe 'file', ->

    describe 'chmod', ->

      they 'change permission', (ssh, next) ->
        misc.file.writeFile ssh, "#{scratch}/a_file", "hello", (err, exists) ->
          misc.file.chmod ssh, "#{scratch}/a_file", '546', (err) ->
            return next err if err
            misc.file.stat ssh, "#{scratch}/a_file", (err, stat) ->
              "0o0#{(stat.mode & 0o0777).toString 8}".should.eql '0o0546'
              next err

    describe 'write', ->

      they 'append', (ssh, next) ->
        misc.file.writeFile ssh, "#{scratch}/a_file", "hello", flags: 'a', (err, exists) ->
          return next err if err
          misc.file.writeFile ssh, "#{scratch}/a_file", "world", flags: 'a', (err, exists) ->
            return next err if err
            misc.file.readFile ssh, "#{scratch}/a_file", 'utf8', (err, content) ->
              content.should.eql "helloworld"
              next()

    describe 'exists', ->

      it 'check local filesystem', (next) ->
        misc.file.exists null, "#{__filename}", (err, exists) ->
          exists.should.be.ok
          misc.file.exists null, "#{__filename}/nothere", (err, exists) ->
            exists.should.not.be.ok
            next()

      it 'check over ssh', (next) ->
        connect host: 'localhost', (err, ssh) ->
          misc.file.exists ssh, "#{__filename}", (err, exists) ->
            exists.should.be.ok
            misc.file.exists ssh, "#{__filename}/nothere", (err, exists) ->
              exists.should.not.be.ok
              next()

    describe 'stat', ->

      it 'check local file', (next) ->
        misc.file.stat null, __filename, (err, stat) ->
          return next err if err
          stat.isFile().should.be.ok
          next()

      it 'check remote file', (next) ->
        connect host: 'localhost', (err, ssh) ->
          misc.file.stat ssh, __filename, (err, stat) ->
            return next err if err
            stat.isFile().should.be.ok
            next()

      it 'check local directory', (next) ->
        misc.file.stat null, __dirname, (err, stat) ->
          return next err if err
          stat.isDirectory().should.be.ok
          next()

      it 'check remote directory', (next) ->
        connect host: 'localhost', (err, ssh) ->
          misc.file.stat ssh, __dirname, (err, stat) ->
            return next err if err
            stat.isDirectory().should.be.ok
            next()

      it 'check local does not exists', (next) ->
        misc.file.stat null, "#{__dirname}/noone", (err, stat) ->
          err.code.should.eql 'ENOENT'
          next()

      it 'check remote does not exists', (next) ->
        connect host: 'localhost', (err, ssh) ->
          misc.file.stat ssh, "#{__dirname}/noone", (err, stat) ->
            err.code.should.eql 'ENOENT'
            next()

    describe 'hash', ->

      it 'returns the file md5', (next) ->
        misc.file.hash "#{__dirname}/../resources/render.eco", (err, md5) ->
          return next err if err
          md5.should.eql '287621a8df3c3f6c99c7b7645bd09ffd'
          next()

      it 'throws error if file does not exist', (next) ->
        misc.file.hash "#{__dirname}/does/not/exist", (err, md5) ->
          err.message.should.eql "Does not exist: #{__dirname}/does/not/exist"
          should.not.exist md5
          next()

      it 'returns the directory md5', (next) ->
        misc.file.hash "#{__dirname}/../resources", (err, md5) ->
          return next err if err
          md5.should.eql 'e667d74986ef3f22b7b6b7fc66d5ea59'
          next()

      it 'returns the directory md5 when empty', (next) ->
        mecano.mkdir "#{scratch}/a_dir", (err, created) ->
          return next err if err
          misc.file.hash "#{scratch}/a_dir", (err, md5) ->
            return next err if err
            md5.should.eql crypto.createHash('md5').update('').digest('hex')
            next()

    describe 'compare', ->

      it '2 differents files', (next) ->
        file = "#{__dirname}/../resources/render.eco"
        misc.file.compare [file, file], (err, md5) ->
          return next err if err
          md5.should.eql '287621a8df3c3f6c99c7b7645bd09ffd'
          next()

      # it 'throw error if there is a directory', (next) ->
      #   file = "#{__dirname}/../resources/render.eco"
      #   misc.file.compare [file, __dirname], (err, md5) ->
      #     err.message.should.eql "Is a directory: #{__dirname}"
      #     should.not.exist md5
      #     next()

    describe 'remove', ->

      remove = (ssh, next) ->
        mecano.mkdir
          ssh: ssh
          destination: "#{scratch}/remove_dir"
        , (err, created) ->
          return next err if err
          misc.file.remove ssh, "#{scratch}/remove_dir", (err) ->
            return next err if err
            misc.file.exists ssh, "#{scratch}/remove_dir", (err, exists) ->
              return next err if err
              exists.should.not.be.ok
              next()

      it 'a local dir', (next) ->
        remove null, next

      it 'a remote dir', (next) ->
        connect host: 'localhost', (err, ssh) ->
          remove ssh, next

      it 'handle a missing local dir', (next) ->
        misc.file.remove null, "#{scratch}/remove_missing_dir", (err) ->
          misc.file.exists null, "#{scratch}/remove_missing_dir", (err, exists) ->
            return next err if err
            exists.should.not.be.ok
            next()

      it 'handle a missing remote dir', (next) ->
        connect host: 'localhost', (err, ssh) ->
          misc.file.remove ssh, "#{scratch}/remove_missing_dir", (err) ->
            misc.file.exists ssh, "#{scratch}/remove_missing_dir", (err, exists) ->
              return next err if err
              exists.should.not.be.ok
              next()

