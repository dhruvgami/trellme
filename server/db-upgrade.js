(function() {
  'use strict';

  /*\
  |*| What do we need to do?
  |*| 1. We need to make sure that the users have a "settings" field/attribute.
  |*|    Loop over each of the users in the collection and check if the field
  |*|    exists. If it doesn't, create it with the defaults.
  |*| 2. We need to make sure that the boards have a "boards.enabled" attribute.
  |*|    If it doesn't have it we must set it. The formula is:
  |*|    board.enabled = !board.boards.closed;
  |*| That's it!
  \*/

  var conn   = new Mongo()
    , db     = conn.getDB('trellme')
    , users  = db.users.find()
    , boards = db.boards.find();

  while (users.hasNext()) {
    var user = users.next();
    if (!user.settings) {
      var attrs = {
        settings : {
          daily_email : true,
          manual_sync : false
        }
      };
      print(['>> Updating user with id ', user._id].join(''));
      db.users.update({ _id : user._id }, { $set : attrs });
    }
  }

  while (boards.hasNext()) {
    var board = boards.next();
    if (!board.enabled) {
      var attrs = {
        enabled : !board.boards.closed
      };
      print(['>> Updating board with id ', board._id].join(''));
      db.boards.update({ _id : board._id }, { $set : attrs });
    }
  }

  print('done!');
}());
