ObjectID = require('mongodb').ObjectID
db       = require './dbconnection'

module.exports = class Lists extends db
  @colName: 'lists'

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
