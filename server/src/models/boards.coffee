ObjectID = require('mongodb').ObjectID
db       = require './dbconnection'

module.exports = class Boards extends db
  @colName: 'boards'

  # Retrieve all boards that belong to a user
  @findByUserId: (userId, cb) ->
    userId = new ObjectID(userId) if typeof userId is 'string'
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ user_id : userId }).
        toArray(cb)

  # Retrieve all boards that belong to a user and that are enabled.
  @findEnabledByUserId: (userId, cb) ->
    userId = new ObjectID(userId) if typeof userId is 'string'
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ user_id : userId, enabled : true }).
        toArray(cb)

  # Update a board
  # boardId: Either String or ObjectID
  # Returns the updated board.
  @updateBoard: (boardId, attrs, cb) ->
    boardId = new ObjectID(boardId) if typeof boardId is 'string'
    @collection (err, col) ->
      return cb(err, null) if err
      col.findAndModify { _id : boardId }, null, { $set : attrs }, { new : true }, cb
