#
# users.coffee
#
#  users collection has only email, password and settings
#   { "_id" : ObjectId("518b37d647f1af1b31be73f4"), "email" : "test255@gmail.com", "password" : "password", "settings" : {} }
#
_            = require 'underscore'
should       = require 'should'
mongodb      = require 'mongodb'
ObjectID     = require('mongodb').ObjectID
dbconnection = require './dbconnection'
Boards       = require './boards'
Trellos      = require './trellos'
GenPassword  = require '../helpers/genpassword'


module.exports = class Users extends dbconnection
    genpass: null

    #
    # Constructor
    #
    constructor: ->
        super()
        @genpass = new GenPassword()

    #
    # Looks up a user data from email (username)
    #
    findByEmail: (email, fn) ->
      dbconnection.get_client (err, p_client) ->
        p_client.collection 'users', (err, col) ->
          if err
            return fn(err, null)
          col.findOne { email: email }, (err, user) ->
            fn(err, user)

    # Get all users with "daily email" setting enabled.
    subscribedUsers: (fn) ->
      dbconnection.get_client (err, db) ->
        db.
          collection('users').
          find({ 'settings.daily_email' : true }).
          toArray(fn)

    #
    # Checks if password matches the user.password
    #
    verifyPassword: (user, password) ->
      @genpass.validateHash(user.password, password)

    #
    # Get all users
    #
    findAll: (fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'users', (err, col) =>
                if err
                    return fn(err, null)
                col.find {}, (err, cursor) =>
                    if err
                        return fn(err, null)
                    cursor.toArray (err, items) =>
                        items.length.should.be.above(0)
                        fn(err, items)

    #
    # Update user document - store token_secret
    # user_id: user ID in string
    # value: token_secret string
    #
    save_token_secret: (user_id, value, fn) ->
      dbconnection.get_client (err, p_client) =>
        p_client.collection 'users', (err, col) =>
          if err
            return fn(err, null)
          col.update { _id: new ObjectID user_id }, { $set: { token_secret: value } }, (err) =>
            if err
              return fn(err, null)
            else
              fn(null, "update success")

    getUserSettings: (userId, cb) ->
      @get userId, (err, user) ->
        return cb(err, null) if err
        new Trellos().getBoards userId, (err, boards) ->
          return cb(err, null) if err
          boards = _(boards).map (board) ->
            _id     : board._id
            name    : board.boards.name
            closed  : board.boards.closed
            enabled : board.enabled
          settings = _(user.settings).extend(boards : boards)
          cb null, settings

    saveUserSettings: (userId, settings, cb) ->
      settings.boards = settings.boards || []
      userSettings    =
        daily_email : settings.daily_email
        manual_sync : settings.manual_sync
      dbconnection.get_client (err, client) ->
        client.collection 'users', (err, collection) ->
          return cb(err, null) if err
          collection.findAndModify { _id : userId }, null, { $set : { settings : userSettings } }, { new : true }, (err, user) ->
            return cb(err, null) if err
            _(settings.boards).each (board) ->
              Boards.updateBoard board._id, { enabled : board.enabled }, (err, obj) ->
                return cb(err, null) if err
            cb(null, user.settings)

    #
    # Update user document - store access token
    # user_id: user ID in string
    # values: user data - must match users document key-value pairs
    #
    save_access_token: (user_id, values, fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'users', (err, col) =>
                if err
                    return fn(err, null)
                col.update { _id:  new ObjectID user_id }, { $set: values }, (err) =>
                    if err
                        return fn(err, null)
                    else
                        fn(null, "update success")

    #
    # Get user documemt by _id
    # userId: Either String or ObjectID
    #
    get: (userId, fn) ->
      userId = new ObjectID(userId) if typeof userId is 'string'
      dbconnection.get_client (err, p_client) =>
        p_client.collection 'users', (err, col) =>
          if err
            return fn(err, null)
          col.findOne { _id: userId }, (err, user) =>
            fn(null, user)

    #
    # Add a new user
    # params: email, password, trello_username, tzdiff
    #
    add: (params, fn) ->
      # These must exist
      should.exist(params.email)
      should.exist(params.password)
      should.exist(params.trello_username)
      # Check email address
      if not params.email.match(/^[a-zA-Z0-9\\.!#$%&'*+\-/=?\^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
        return fn(500, "Invalid email address")
      # Check trello username
      if not params.trello_username.match(/^[a-zA-Z\\.\-0-9_]+$/)
        return fn(500, "Invalid Trello username")

      # Values are good
      dbconnection.get_client (err, p_client) =>
        p_client.collection 'users', (err, col) =>
          if err
            fn(500, "Failed to insert a user")
            return
          values =
            email           : params.email
            password        : @genpass.createHash(params.password)
            trello_username : params.trello_username
            tzdiff          : params.tzdiff
            created         : new Date()
            settings        :
              daily_email: true
              manual_sync: false
          col.insert values, (err, docs) =>
            fn(null, "Add user suceess")

    #
    # Remove a user
    # user_id: user ID in string
    #
    remove: (user_id, fn) ->
        should.exist(user_id)
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'users', (err, col) =>
                if err
                    fn(500, "Failed to insert a user")
                    return
                col.remove {_id: new ObjectID user_id}, (err, docs)=>
                    fn(null, "Remove user suceess")
