#
# users.coffee
#
#  users collection has only email, password and settings
#   { "_id" : ObjectId("518b37d647f1af1b31be73f4"), "email" : "test255@gmail.com", "password" : "password", "settings" : {} }
#
_            = require 'underscore'
async        = require 'async'
should       = require 'should'
mongodb      = require 'mongodb'
ObjectID     = require('mongodb').ObjectID
dbconnection = require './dbconnection'
Boards       = require './boards'
Trellos      = require './trellos'
GenPassword  = require '../helpers/genpassword'

module.exports = class Users extends dbconnection
  @colName: 'users'

  # - Class Methods - #
  # Find user by id
  # TODO: Maybe return an user's instance with methods like for verifying
  #       password, updating attributes and that kind of stuff?
  @find: (userId, cb) ->
    userId = new ObjectID(userId) if typeof userId is 'string'
    @collection (err, col) ->
      return cb(err, null) if err
      col.
        findOne({ _id : userId }, cb)

  # Get all users
  @findAll: (cb) ->
    @collection (err, col) ->
      col.
        find({}).
        toArray(cb)

  # Find user by email.
  @findByEmail: (email, cb) ->
    @collection (err, col) ->
      return cb(err, null) if err
      col.findOne({ email: email }, cb)

  # Find a user record and remove it.
  @remove: (userId, cb) ->
    userId = new ObjectID(userId) if typeof userId is 'string'
    @collection (err, col) ->
      return cb(err, null) if err
      col.remove { _id : userId }, cb

  # Get all users with "daily email" setting enabled.
  @subscribedUsers: (cb) ->
    @collection (err, col) ->
      return cb(err, null) if err
      col.
      find({ 'settings.daily_email' : true }).
      toArray(cb)

  @getUserSettings: (userId, cb) ->
    @find userId, (err, user) ->
      return cb(err, null) if err
      Boards.findByUserId userId, (err, boards) ->
        return cb(err, null) if err
        boards = _(boards).map (board) ->
          _id     : board._id
          name    : board.boards.name
          closed  : board.boards.closed
          enabled : board.enabled
        settings = _(user.settings).extend(boards : boards)
        cb null, settings

  # Save user settings
  @saveUserSettings: (userId, settings, cb) ->
    settings.boards = settings.boards || []
    userSettings    =
      daily_email : settings.daily_email
      manual_sync : settings.manual_sync
    @collection (err, collection) ->
      return cb(err, null) if err
      collection.findAndModify { _id : userId }, null, { $set : { settings : userSettings } }, { new : true }, (err, user) ->
        return cb(err, null) if err
        async.each(settings.boards, (board, asyncCB) ->
          Boards.updateBoard board._id, { enabled : board.enabled }, (err, obj) ->
            asyncCB(err)
        , (err) ->
          cb(err, user.settings)
        )

  @serialize: (user, done) ->
    done(null, user._id)

  @deserialize: (id, done) =>
    @find(id, done)

  # - Instnace Methods - #
  genpass: null

  #
  # Constructor
  #
  constructor: ->
      super()
      @genpass = new GenPassword()

  #
  # Checks if password matches the user.password
  # TODO: This should use (static) class methods from GenPassword class.
  verifyPassword: (user, password) ->
    @genpass.validateHash(user.password, password)

  # TODO: Deprecate this method as we are now using session-based auth with
  #       email and password.
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

  # TODO: Deprecate this method in favor of #find()
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

  # TODO: Move this to a class method.
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
