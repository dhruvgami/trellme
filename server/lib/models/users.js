// Generated by CoffeeScript 1.6.3
(function() {
  var GenPassword, ObjectID, Users, dbconnection, mongodb, should,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mongodb = require('mongodb');

  ObjectID = require('mongodb').ObjectID;

  dbconnection = require('./dbconnection');

  should = require('should');

  GenPassword = require('../helpers/genpassword');

  module.exports = Users = (function(_super) {
    __extends(Users, _super);

    Users.prototype.genpass = null;

    function Users() {
      Users.__super__.constructor.call(this);
      this.genpass = new GenPassword();
    }

    Users.prototype.findByEmail = function(email, fn) {
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('users', function(err, col) {
          if (err) {
            return fn(err, null);
          }
          return col.findOne({
            email: email
          }, function(err, user) {
            return fn(err, user);
          });
        });
      });
    };

    Users.prototype.verifyPassword = function(user, password) {
      return this.genpass.validateHash(user.password, password);
    };

    Users.prototype.findAll = function(fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('users', function(err, col) {
          if (err) {
            return fn(err, null);
          }
          return col.find({}, function(err, cursor) {
            if (err) {
              return fn(err, null);
            }
            return cursor.toArray(function(err, items) {
              items.length.should.be.above(0);
              return fn(err, items);
            });
          });
        });
      });
    };

    Users.prototype.save_token_secret = function(user_id, value, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('users', function(err, col) {
          if (err) {
            return fn(err, null);
          }
          return col.update({
            _id: new ObjectID(user_id)
          }, {
            $set: {
              token_secret: value
            }
          }, function(err) {
            if (err) {
              return fn(err, null);
            } else {
              return fn(null, "update success");
            }
          });
        });
      });
    };

    Users.prototype.saveUserSettings = function(userId, settings, fn) {
      var userSettings;
      userSettings = {
        daily_email: settings.daily_email || true,
        manual_sync: settings.manual_sync || false
      };
      return dbconnection.get_client(function(err, client) {
        return client.collection('users', function(err, collection) {
          if (err) {
            return fn(err, null);
          } else {
            return collection.findAndModify({
              _id: new ObjectID(userId)
            }, null, {
              $set: {
                settings: userSettings
              }
            }, {
              "new": true
            }, fn);
          }
        });
      });
    };

    Users.prototype.save_access_token = function(user_id, values, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('users', function(err, col) {
          if (err) {
            return fn(err, null);
          }
          return col.update({
            _id: new ObjectID(user_id)
          }, {
            $set: values
          }, function(err) {
            if (err) {
              return fn(err, null);
            } else {
              return fn(null, "update success");
            }
          });
        });
      });
    };

    Users.prototype.get = function(user_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('users', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.findOne({
            _id: new ObjectID(user_id)
          }, function(err, user) {
            return fn(null, user);
          });
        });
      });
    };

    Users.prototype.get2 = function(user_id, fn) {
      var _this = this;
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('users', function(err, col) {
          if (err) {
            fn(err, null);
            return;
          }
          return col.findOne({
            _id: user_id
          }, function(err, user) {
            if (err) {
              return fn(500, null);
            } else {
              return fn(null, user);
            }
          });
        });
      });
    };

    Users.prototype.add = function(params, fn) {
      var _this = this;
      should.exist(params.email);
      should.exist(params.password);
      should.exist(params.trello_username);
      if (!params.email.match(/^[a-zA-Z0-9\\.!#$%&'*+\-/=?\^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
        return fn(500, "Invalid email address");
      }
      if (!params.trello_username.match(/^[a-zA-Z\\.\-0-9_]+$/)) {
        return fn(500, "Invalid Trello username");
      }
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('users', function(err, col) {
          var values;
          if (err) {
            fn(500, "Failed to insert a user");
            return;
          }
          values = {
            email: params.email,
            password: _this.genpass.createHash(params.password),
            trello_username: params.trello_username,
            tzdiff: params.tzdiff,
            created: new Date(),
            settings: {
              daily_email: true,
              manual_sync: false
            }
          };
          return col.insert(values, function(err, docs) {
            return fn(null, "Add user suceess");
          });
        });
      });
    };

    Users.prototype.remove = function(user_id, fn) {
      var _this = this;
      should.exist(user_id);
      return dbconnection.get_client(function(err, p_client) {
        return p_client.collection('users', function(err, col) {
          if (err) {
            fn(500, "Failed to insert a user");
            return;
          }
          return col.remove({
            _id: new ObjectID(user_id)
          }, function(err, docs) {
            return fn(null, "Remove user suceess");
          });
        });
      });
    };

    return Users;

  })(dbconnection);

}).call(this);
