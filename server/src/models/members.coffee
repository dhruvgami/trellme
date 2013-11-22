ObjectID = require('mongodb').ObjectID
db       = require './dbconnection'

module.exports = class Lists extends db
  @colName: 'members'

  @findByMemberId: (memberId, cb) ->
    memberId = memberId.toString() if memberId instanceof ObjectID
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ member_id : memberId }).
        toArray(cb)

  @findByUserId: (userId, cb) ->
    userId = new ObjectID(userId) unless userId instanceof ObjectID
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        find({ user_id : userId }).
        toArray(cb)
