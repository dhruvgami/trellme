#
# tokens.coffee
#
#  a model for tokens collection.
#    {"token": token, "user_id": user_id, "expire": expiry-datetime}
# 
mongodb = require 'mongodb'
dbconnection = require './dbconnection'
should = require('should')
crypto = require('crypto')


module.exports = class Tokens extends dbconnection

    #
    # Constructor
    # 
    constructor: ->
        super()

    #
    # Creates a new token for a user
    # fn usually takes two args - err and returning data object if any
    # 
    create: (user, fn) ->
        should.exist(user)
        should.exist(fn)        
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            p_client.collection 'tokens', (err, col) =>
                token = @_createToken user  # Create a new token
                now = new Date()
                exp = new Date(now.getTime() + 86400000)  # + 1 day
                #expire = exp.toString('yyyy-MM-dd HH:mm:ss')
                col.insert {'token': token, 'user_id': user._id, 'expire': exp}, (err, docs)=>
                    p_client.close()
                    fn(err, docs)

    #
    # YOUR TODO:
    # You can creat access token here. Make a random charactor string
    # with your favorite method.
    # 
    _createToken: (user) ->
        hash = crypto.createHash('sha512');
        hash.update(user._id.toString())
        hash.update(((new Date()).getTime()).toString())
        hash.digest('hex')
        #user._id.toString()+((new Date()).getTime()).toString()

    #
    # Delete a token = logout
    # 
    "delete": (token, fn) ->
        should.exist(token)
        should.exist(fn)        
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            p_client.collection 'tokens', (err, col) =>
                col.remove {'token': token}, (err, wtf)=>
                    p_client.close()
                    fn(err, wtf)

    #
    # Check the existence of arg token and make sure expiry isn't reached.
    # 
    validate: (token, fn) ->
        if typeof token is 'undefined'
            fn(401, "Missing token")
            return
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            p_client.collection 'tokens', (err, col) =>
                now = new Date()
                col.findOne {'token': token, 'expire': {'$gt': now }}, (err, wtf)=>
                    p_client.close()
                    #console.log(wtf)
                    fn(err, wtf)  # null or a token record
