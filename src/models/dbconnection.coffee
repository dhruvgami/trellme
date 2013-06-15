#
# dbconnection.coffee
#
#  The super class for all DB models.
# 
mongodb = require 'mongodb'
should  = require 'should'


module.exports = class dbconnection
    @client: null
    @dbopts:
        host:     "127.0.0.1",
        port:     27017,
        db:       "trellme",
    @p_client: null

    #
    # Creates Db instance and save it as a class variable.
    # 
    constructor: () ->
        if dbconnection.client is null
            # using native parser
            dbconnection.client = new mongodb.Db(dbconnection.dbopts.db, new mongodb.Server(dbconnection.dbopts.host, dbconnection.dbopts.port, {auto_reconnect: true}), {native_parser:true, w: 1})

    #
    # Returns client object.
    # 
    @get_client: (fn) ->
        if dbconnection.p_client isnt null
            fn(null, dbconnection.p_client)
            return
        dbconnection.client.open (err, p_client) ->
            if err
                fn(500, 'client.open fail')
            else
                dbconnection.p_client = p_client
                fn(null, p_client)

