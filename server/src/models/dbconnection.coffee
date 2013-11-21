#
# dbconnection.coffee
#
#  The super class for all DB models.
#
MongoClient = require('mongodb').MongoClient

module.exports = class dbconnection
  @db: null

  # Get DB
  @get_client: (fn) ->
    if dbconnection.db isnt null
      fn(null, dbconnection.db)
    else
      MongoClient.connect 'mongodb://127.0.0.1:27017/trellme', (err, db) =>
        if err
          throw err
        else
          dbconnection.db = db
          fn(null, dbconnection.db)

  # Get collection
  @collection: (cb) ->
    if @colName is undefined
      throw new Error 'colName not defined'
    @get_client (err, client) =>
      return cb(err, null) if err
      client.collection(@colName, cb)
