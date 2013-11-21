ObjectID = require('mongodb').ObjectID
db       = require './dbconnection'

module.exports = class Lists extends db
  @colName: 'actions'

  @findByBoardId: (boardId, cb) ->
    boardId = boardId.toString() if boardId instanceof ObjectID
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ 'data.board.id' : boardId }).
        toArray(cb)
