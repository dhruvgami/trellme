#
# genpassword.coffee
#  copied from:  https://gist.github.com/soplakanets/980737
# 
crypto = require 'crypto'


module.exports = class GenPassword
    @SaltLength: 9

    #
    @md5: (string) ->
      crypto.createHash("md5").update(string).digest "hex"

    #
    @validateHash: (hash, password) ->
      salt = hash.substr(0, GenPassword.SaltLength)
      validHash = salt + @md5(password + salt)
      hash is validHash

    #
    @createHash: (password) ->
      salt = @generateSalt(GenPassword.SaltLength)
      hash = @md5(password + salt)
      salt + hash

    #
    @generateSalt: (len) ->
      set = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ"
      setLen = set.length
      salt = ""
      i = 0
      while i < len
        p = Math.floor(Math.random() * setLen)
        salt += set[p]
        i++
      salt
