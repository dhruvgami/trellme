// Generated by CoffeeScript 1.6.3
(function() {
  var ObjectID, Trellos, async, dbconnection, mongodb, should, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mongodb = require('mongodb');

  ObjectID = require('mongodb').ObjectID;

  dbconnection = require('./dbconnection');

  should = require('should');

  _ = require('underscore');

  async = require('async');

  module.exports = Trellos = (function(_super) {
    __extends(Trellos, _super);

    function Trellos() {
      Trellos.__super__.constructor.call(this);
    }

    Trellos.prototype.save_member = function(user_id, member_id, name, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('members', function(err, col) {
          if (err) {
            return fn(500, null);
          }
          return col.findOne({
            user_id: user_id,
            member_id: member_id
          }, function(err, wtf) {
            if (err) {
              return fn(500, null);
            } else if (wtf !== null) {
              return fn(null, "Already there");
            } else {
              return col.insert({
                user_id: user_id,
                member_id: member_id,
                name: name._value
              }, function(err) {
                if (err) {
                  return fn(500, null);
                } else {
                  return fn(null, "save member success");
                }
              });
            }
          });
        });
      });
    };

    Trellos.prototype.clear_all = function(uid, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('actions', function(err, col) {
          return col.remove({
            user_id: uid
          }, function(err, resp) {
            if (err) {
              return fn(500, "Failed to remove actions for user " + user_id);
            }
            return p_client.collection('cards', function(err, col) {
              return col.remove({
                user_id: uid
              }, function(err, resp) {
                if (err) {
                  return fn(500, "Failed to remove cards for user " + user_id);
                }
                return p_client.collection('lists', function(err, col) {
                  return col.remove({
                    user_id: uid
                  }, function(err, resp) {
                    if (err) {
                      return fn(500, "Failed to remove lists for user " + user_id);
                    }
                    return p_client.collection('boards', function(err, col) {
                      return col.remove({
                        user_id: uid
                      }, function(err, resp) {
                        if (err) {
                          return fn(500, "Failed to remove boards for user " + user_id);
                        }
                        return fn(null, "Cleared everything");
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    };

    Trellos.prototype.save_boards = function(user_id, org_name, boards, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('boards', function(err, col) {
          if (err) {
            return fn(500, null);
          }
          _.each(boards, function(board) {
            return col.find({
              user_id: user_id,
              'boards.id': board.id
            }, function(err, cursor) {
              return cursor.count(function(err, count) {
                if (count === 0) {
                  return col.insert({
                    user_id: user_id,
                    org_name: org_name,
                    boards: board
                  }, function(err) {
                    if (err) {
                      return fn(500, "Insert failed");
                    }
                  });
                }
              });
            });
          });
          return fn(null, "save board success");
        });
      });
    };

    Trellos.prototype.save_lists = function(user_id, board_id, lists, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('lists', function(err, col) {
          if (err) {
            return fn(500, null);
          }
          return col.insert({
            user_id: user_id,
            board_id: board_id,
            lists: lists
          }, function(err) {
            if (err) {
              return fn(500, null);
            } else {
              return fn(null, "save lists success");
            }
          });
        });
      });
    };

    Trellos.prototype.save_cards = function(user_id, board_id, list_id, cards, fn) {
      var _this = this;
      if (cards.length === 0) {
        return fn(null, "nothing to save");
      }
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('cards', function(err, col) {
          if (err) {
            return fn(500, null);
          }
          return col.insert({
            user_id: user_id,
            board_id: board_id,
            list_id: list_id,
            cards: cards
          }, function(err) {
            if (err) {
              return fn(500, null);
            } else {
              return fn(null, "save cards success");
            }
          });
        });
      });
    };

    /*
    save_checklists: (user_id, board_id, list_id, card_id, checklists, fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'checklists', (err, col) =>
                if err
                    return fn(500, null)
                col.insert { user_id: user_id, board_id: board_id, list_id: list_id, card_id: card_id, checklists: checklists}, (err) =>
                    if err
                        return fn(500, null)
                    else
                        fn(null, "save checklists success")
    */


    Trellos.prototype.save_actions = function(user_id, actions, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('actions', function(err, col) {
          if (err) {
            return fn(500, null);
          }
          actions = actions.slice(0, 10);
          _.each(actions, function(action) {
            action.user_id = user_id;
            return col.insert(action, function(err) {
              if (err) {
                return fn(500, null);
              }
            });
          });
          return fn(null, "save actions success");
        });
      });
    };

    Trellos.prototype.get_boards = function(user_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('boards', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id
          }, function(err, cursor) {
            if (err) {
              return fn(500, "Boards not found");
            }
            return cursor.toArray(function(err, items) {
              return fn(err, items);
            });
          });
        });
      });
    };

    Trellos.prototype.get_all_lists = function(user_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('lists', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id
          }, function(err, cursor) {
            if (err) {
              return fn(500, "Lists not found");
            }
            return cursor.toArray(function(err, items) {
              return fn(err, items);
            });
          });
        });
      });
    };

    Trellos.prototype.get_all_cards = function(user_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('cards', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id
          }, function(err, cursor) {
            if (err) {
              return fn(500, "Cards not found");
            }
            return cursor.toArray(function(err, items) {
              return fn(err, items);
            });
          });
        });
      });
    };

    Trellos.prototype.get_all_checklists = function(user_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('checklists', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id
          }, function(err, cursor) {
            if (err) {
              return fn(500, "Checklists not found");
            }
            return cursor.toArray(function(err, items) {
              return fn(err, items);
            });
          });
        });
      });
    };

    Trellos.prototype.get_lists_of_board = function(user_id, board_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('lists', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id,
            board_id: board_id
          }, function(err, cursor) {
            if (err) {
              return fn(500, "Lists not found");
            }
            return cursor.toArray(function(err, items) {
              return fn(err, items);
            });
          });
        });
      });
    };

    Trellos.prototype.get_cards_of_list = function(user_id, list_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('cards', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id,
            list_id: list_id
          }, function(err, cursor) {
            if (err) {
              return fn(500, "Cards not found");
            }
            return cursor.toArray(function(err, items) {
              return fn(err, items);
            });
          });
        });
      });
    };

    Trellos.prototype.get_checklists_of_list = function(user_id, list_id, card_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('checklists', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id,
            list_id: list_id,
            card_id: card_id
          }, function(err, cursor) {
            if (err) {
              return fn(500, "get_checklists_of_list error");
            }
            return cursor.toArray(function(err, items) {
              return fn(err, items);
            });
          });
        });
      });
    };

    Trellos.prototype.get_member = function(user_id, member_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('members', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.findOne({
            user_id: user_id,
            member_id: member_id
          }, function(err, wtf) {
            if (err) {
              return fn(500, "get_member error");
            }
            return fn(err, wtf);
          });
        });
      });
    };

    Trellos.prototype.get_all_members = function(user_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('members', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id
          }, function(err, cursor) {
            if (err) {
              return fn(500, "get_all_members error");
            }
            return cursor.toArray(function(err, items) {
              return fn(err, items);
            });
          });
        });
      });
    };

    Trellos.prototype.get_actions = function(user_id, board_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('actions', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id,
            'data.board.id': board_id
          }).sort({
            date: -1
          }, function(err, cursor) {
            if (err) {
              return fn(500, "get_actions error");
            }
            return cursor.limit(10, function(err, cur) {
              return cursor.toArray(function(err, items) {
                return fn(err, items);
              });
            });
          });
        });
      });
    };

    Trellos.prototype.get_all_actions = function(user_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('actions', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.find({
            user_id: user_id
          }).sort({
            date: -1
          }, function(err, cursor) {
            if (err) {
              return fn(500, "get_actions error");
            }
            return cursor.limit(100, function(err, cur) {
              return cursor.toArray(function(err, items) {
                return fn(err, items);
              });
            });
          });
        });
      });
    };

    Trellos.prototype.get_all_data = function(user_id, fn) {
      var all,
        _this = this;
      all = {};
      return async.parallel({
        boards: function(cb) {
          return _this.get_boards(user_id, function(err, myboards) {
            if (err) {
              return cb(500, 'Couldnt read data');
            } else {
              all.boards = myboards;
              return cb(null, 1);
            }
          });
        },
        lists: function(cb) {
          return _this.get_all_lists(user_id, function(err, mylists) {
            if (err) {
              return cb(500, 'Couldnt read data');
            } else {
              all.lists = mylists;
              return cb(null, 2);
            }
          });
        },
        cards: function(cb) {
          return _this.get_all_cards(user_id, function(err, mycards) {
            if (err) {
              return cb(500, 'Couldnt read data');
            } else {
              all.cards = mycards;
              return cb(null, 3);
            }
          });
        },
        actions: function(cb) {
          return _this.get_all_actions(user_id, function(err, myactions) {
            if (err) {
              return cb(500, 'Couldnt read data');
            } else {
              all.actions = myactions;
              return cb(null, 4);
            }
          });
        },
        members: function(cb) {
          return _this.get_all_members(user_id, function(err, mymembers) {
            if (err) {
              return cb(500, 'Couldnt read data');
            } else {
              all.members = mymembers;
              return cb(null, 5);
            }
          });
        }
      }, function(err, results) {
        return fn(null, all);
      });
    };

    return Trellos;

  })(dbconnection);

}).call(this);
