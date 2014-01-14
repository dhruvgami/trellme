_        = require('underscore')
ObjectID = require('mongodb').ObjectID
db       = require './dbconnection'

module.exports = class Boards extends db
  # - Collection Name - #
  @colName: 'boards'

  # - Indexes - #
  @index 'user_id'

  # - Class Methods - #
  # Retrieve all boards that belong to a user
  @findByUserId: (userId, cb) ->
    userId = new ObjectID(userId) if typeof userId is 'string'
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ user_id : userId }).
        toArray(cb)

  # Retrieve all boards that belong to a user, that are enabled and that are
  # in the given date range (if given).
  @findEnabledByUserId: (userId, dateRange, cb) ->
    if _.isFunction dateRange
      cb        = dateRange
      dateRange = {}

    options =
      user_id : userId
      enabled : true

    if dateRange.from and dateRange.to
      options['boards.dateLastActivity'] =
        $gte : dateRange.from
        $lte : dateRange.to

    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find(options).
        toArray(cb)

  # Update a board
  # boardId: Either String or ObjectID
  # Returns the updated board.
  @updateBoard: (boardId, attrs, cb) ->
    boardId = new ObjectID(boardId) if typeof boardId is 'string'
    @collection (err, col) ->
      return cb(err, null) if err
      col.findAndModify { _id : boardId }, null, { $set : attrs }, { new : true }, cb
