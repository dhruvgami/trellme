ObjectID = require('mongodb').ObjectID
db       = require './dbconnection'

module.exports = class Actions extends db
  # - Collection Name - #
  @colName: 'actions'

  # - Indexes - #
  @index 'data.board.id'
  @index 'user_id'

  # - Class Methods - #
  @findByBoardId: (boardId, cb) ->
    boardId = boardId.toString() if boardId instanceof ObjectID
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ 'data.board.id' : boardId }).
        toArray(cb)

  @findByUserId: (userId, cb) ->
    userId = new ObjectID(userId) unless userId instanceof ObjectID
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ user_id : userId }).
        toArray(cb)
