#
# dbconnection.coffee
#
#  The super class for all DB models.
#
config      = require(__dirname + '/../../config/config.json')
MongoClient = require('mongodb').MongoClient

module.exports = class dbconnection
  # - Class Methods - #
  @db: null

  # Get DB
  @get_client: (fn) ->
    if dbconnection.db isnt null
      fn(null, dbconnection.db)
    else
      # TODO: Retrieve the connection string from an external source!
      MongoClient.connect config.db.uri, (err, db) =>
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

  # - Instance Methods - #
  constructor: (attrs = {}) ->
    @[attr] = val for attr, val of attrs

  # Make every child class to implement this function
  toJSON: ->
    throw new Error 'Not yet implemented'
