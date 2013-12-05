(function() {
  'use strict';

  var Actions = require('./lib/models/actions')
    , Boards  = require('./lib/models/boards')
    , Cards   = require('./lib/models/cards')
    , Lists   = require('./lib/models/lists')
    , Members = require('./lib/models/members')
    , Tokens  = require('./lib/models/tokens')
    , Trellos = require('./lib/models/trellos')
    , Users   = require('./lib/models/users');

  [
    Actions,
    Boards,
    Cards,
    Lists,
    Members,
    Tokens,
    Trellos,
    Users
  ].forEach(function(model) {
    model.buildIndexes();
  });
}());
