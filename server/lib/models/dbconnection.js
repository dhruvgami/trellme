// Generated by CoffeeScript 1.6.3
(function() {
  var MongoClient, async, config, dbconnection;

  config = require(__dirname + '/../../config/config.json');

  async = require('async');

  MongoClient = require('mongodb').MongoClient;

  module.exports = dbconnection = (function() {
    dbconnection.db = null;

    dbconnection.index = function(field, options) {
      this.indexes || (this.indexes = []);
      return this.indexes.push({
        field: field,
        options: options
      });
    };

    dbconnection.buildIndexes = function() {
      var _ref,
        _this = this;
      if (0 < ((_ref = this.indexes) != null ? _ref.length : void 0)) {
        return this.collection(function(err, col) {
          if (err) {
            throw err;
          }
          return async.each(_this.indexes, function(index, asyncCB) {
            return col.ensureIndex(index.field, index.options, function(err, indexName) {
              if (err) {
                console.log("Error while creating index on field " + index.field + " for collection " + _this.colName + ":");
                console.log(err);
              } else {
                console.log("Created index on field " + index.field + " for collection " + _this.colName + " with name " + indexName);
              }
              return asyncCB();
            });
          });
        });
      }
    };

    dbconnection.get_client = function(fn) {
      var _this = this;
      if (dbconnection.db !== null) {
        return fn(null, dbconnection.db);
      } else {
        return MongoClient.connect(config.db.uri, function(err, db) {
          if (err) {
            throw err;
          } else {
            dbconnection.db = db;
            return fn(null, dbconnection.db);
          }
        });
      }
    };

    dbconnection.collection = function(cb) {
      var _this = this;
      if (this.colName === void 0) {
        throw new Error('colName not defined');
      }
      return this.get_client(function(err, client) {
        if (err) {
          return cb(err, null);
        }
        return client.collection(_this.colName, cb);
      });
    };

    function dbconnection(attrs) {
      var attr, val;
      if (attrs == null) {
        attrs = {};
      }
      for (attr in attrs) {
        val = attrs[attr];
        this[attr] = val;
      }
    }

    dbconnection.prototype.toJSON = function() {
      throw new Error('Not yet implemented');
    };

    return dbconnection;

  })();

}).call(this);
