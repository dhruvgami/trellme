// Generated by CoffeeScript 1.6.3
(function() {
  var Lists, ObjectID, db, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ObjectID = require('mongodb').ObjectID;

  db = require('./dbconnection');

  module.exports = Lists = (function(_super) {
    __extends(Lists, _super);

    function Lists() {
      _ref = Lists.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Lists.colName = 'cards';

    Lists.findByBoardId = function(boardId, cb) {
      if (boardId instanceof ObjectID) {
        boardId = boardId.toString();
      }
      return this.collection(function(err, col) {
        if (err) {
          return cb(err, null);
        }
        return col.find({
          board_id: boardId
        }).toArray(cb);
      });
    };

    Lists.findByUserId = function(userId, cb) {
      if (!(userId instanceof ObjectID)) {
        userId = new ObjectID(userId);
      }
      return this.collection(function(err, col) {
        if (err) {
          return cb(err, null);
        }
        return col.find({
          user_id: userId
        }).toArray(cb);
      });
    };

    return Lists;

  })(db);

}).call(this);
