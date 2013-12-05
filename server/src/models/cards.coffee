ObjectID = require('mongodb').ObjectID
db       = require './dbconnection'

module.exports = class Cards extends db
  # - Collection Name - #
  @colName: 'cards'

  # - Indexes - #
  @index 'board_id'
  @index 'user_id'

  # - Class Methods - #
  @findByBoardId: (boardId, cb) ->
    boardId = boardId.toString() if boardId instanceof ObjectID
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ board_id : boardId }).
        toArray(cb)

  @findByUserId: (userId, cb) ->
    userId = new ObjectID(userId) unless userId instanceof ObjectID
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ user_id : userId }).
        toArray(cb)
