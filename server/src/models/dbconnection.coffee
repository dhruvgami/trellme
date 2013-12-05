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
  # WARNING: This method is supposed to be called independently from a script
  #          that runs once (hopefully before running the application) because
  #          this closes the connection to the database in the end.
  @buildIndexes: ->
    if 0 < @indexes?.length
      @get_client (err, db) =>
        throw err if err
        async.each(@indexes, (index, asyncCB) =>
          db.ensureIndex @colName, index.field, index.options, (err, indexName) =>
            if err
              console.log "Error while creating index on field #{index.field} for collection #{@colName}:"
              console.log err
            else
              console.log "[#{@colName}.#{index.field}] index created with name #{indexName}."
            asyncCB()
        , =>
          db.close()
        )

  # Get DB
  # @param callback receives two arguments:
  #        `error` an error object (if any error happens when connecting to db).
  #        `database` the database object.
  @get_client: (cb) ->
    if dbconnection.db isnt null
      cb(null, dbconnection.db)
    else
      # TODO: Retrieve the connection string from an external source!
      MongoClient.connect config.db.uri, (err, db) =>
        if err
          throw err
        else
          dbconnection.db = db
          cb(null, dbconnection.db)

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
