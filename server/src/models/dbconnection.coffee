#  The super class for all DB models.
config      = require(__dirname + '/../../config/config.json')
async       = require('async')
MongoClient = require('mongodb').MongoClient

module.exports = class dbconnection
  # - Class Methods - #
  @db: null

  # @param `field` can either be a string or an object.
  # @param `options` is the options to be passed directly to the driver.
  # See http://mongodb.github.io/node-mongodb-native/markdown-docs/indexes.html
  # for more information.
  @index: (field, options) ->
    @indexes || (@indexes = [])
    @indexes.push field : field, options: options

  # Scan all registered indexes for the current collection and create them.
  @buildIndexes: ->
    if 0 < @indexes?.length
      @collection (err, col) =>
        throw err if err
        async.each @indexes, (index, asyncCB) =>
          col.ensureIndex index.field, index.options, (err, indexName) =>
            if err
              console.log "Error while creating index on field #{index.field} for collection #{@colName}:"
              console.log err
            else
              console.log "Created index on field #{index.field} for collection #{@colName} with name #{indexName}"
            asyncCB()

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
