_            = require 'underscore'
async        = require 'async'
ObjectID     = require('mongodb').ObjectID
dbconnection = require './dbconnection'
Boards       = require './boards'
Trellos      = require './trellos'
GenPassword  = require '../helpers/genpassword'
config       = require '../../config/config'

module.exports = class Users extends dbconnection
  # - Collection Name - #
  @colName: 'users'

  # - Indexes - #
  @index 'email', unique: true
  @index 'settings.daily_email'
  @index 'reset_password_token'

  @emailRegexp : /^[a-zA-Z0-9\\.!#$%&'*+\-/=?\^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

  # - Class Methods - #
  @userFromMongoDocument: (error, document, cb) ->
    error = new Error('User not found') if document is null
    if error
      cb(error, null)
    else
      cb(null, new Users(document))

  # Find user by id
  @find: (userId, cb) ->
    userId = new ObjectID(userId) if typeof userId is 'string'
    @collection (err, col) =>
      return cb(err, null) if err
      col.
        findOne { _id : userId }, (err, doc) =>
          @userFromMongoDocument err, doc, cb

  # TODO: Return user instances.
  # Get all users
  @findAll: (cb) ->
    @collection (err, col) ->
      col.
        find({}).
        toArray(cb)

  # Find user by email.
  @findByEmail: (email, cb) ->
    @collection (err, col) =>
      return cb(err, null) if err
      col.findOne { email: email }, (err, doc) =>
        @userFromMongoDocument err, doc, cb

  # Find user by email.
  @findByResetPasswordToken: (token, cb) ->
    @collection (err, col) =>
      return cb(err, null) if err
      col.findOne { reset_password_token: token }, (err, doc) =>
        @userFromMongoDocument err, doc, cb


  # Create a user
  # params: email, password, trello_username, tzdiff
  @create: (params = {}, cb) ->
    # Check email address
    return cb(500, "Invalid email address") if not params.email.match(Users.emailRegexp)

    # Check trello username
    return cb(500, "Invalid Trello username") if not params.trello_username.match(/^[a-zA-Z\\.\-0-9_]+$/)

    # Values are good
    @collection (err, col) =>
      return cb(500, "Failed to insert a user") if err
      values =
        email           : params.email
        trello_username : params.trello_username
        tzdiff          : params.tzdiff
        password        : GenPassword.createHash(params.password)
        created         : new Date()
        settings        :
          daily_email : true
          manual_sync : false
      col.insert values, { safe : true }, (err, doc) ->
        if err
          cb(err, null)
        else
          cb(null, new Users(doc[0]))

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

  @serialize: (user, done) ->
    done(null, user._id)

  @deserialize: (id, done) =>
    @find(id, done)

  # - Instance Methods - #
  # Fields to expose through the API.
  toJSON: ->
    _id                  : @_id
    email                : @email
    access_token         : @access_token
    trello_username      : @trello_username
    settings             : @settings
    reset_password_token : @reset_password_token

  # Saves a user record.
  # [Function] `cb` param receives `error` if any or user instance.
  save: (values, cb) ->
    return cb(new Error('Document id not present')) unless @_id

    Users.collection (err, col) =>
      return cb(err, null) if err
      col.findAndModify({ _id : @_id }, null, { $set : values }, { new : true }, cb)

  # Get boards that belong to user.
  getBoards: (cb) ->
    Boards.findByUserId(@_id, cb)

  # Get user settings, including board settings.
  getSettings: (cb) ->
    @getBoards (err, boards) =>
      return cb(err, null) if err
      boards = _(boards).map (board) =>
        _id     : board._id
        name    : board.boards.name
        closed  : board.boards.closed
        enabled : board.enabled
      settings = _(@settings || {}).extend(boards : boards)
      cb null, settings

  # Save user settings
  saveSettings: (settings, cb) ->
    settings.boards = settings.boards || []
    userSettings    =
      daily_email : settings.daily_email
      manual_sync : settings.manual_sync
    Users.collection (err, col) =>
      return cb(err, null) if err
      # TODO: Migrate to #update()
      col.findAndModify { _id : @_id }, null, { $set : { settings : userSettings } }, { new : true }, (err, user) ->
        return cb(err, null) if err
        async.each(settings.boards, (board, asyncCB) ->
          Boards.updateBoard board._id, { enabled : board.enabled }, (err, obj) ->
            asyncCB(err)
        , (err) ->
          cb(err, user)
        )

  # Checks if password matches the user.password
  verifyPassword: (password) ->
    GenPassword.validateHash(@password, password)

  # Sets a token for resetting user's password and sends out an email
  # with the link so that the user can continue the process.
  requestPasswordReset: (cb) ->
    token       = GenPassword.generateSalt(20)
    resetParams = { reset_password_token : token }
    @save resetParams, (err, user) =>
      @sendPasswordResetInstructionsEmail()
      cb(err, resetParams)

  # Reset user's password and sets reset_password_token field to blank.
  resetPassword: (password, passwordConfirmation, cb) ->
    if _.isEmpty password
      return cb(new Error("Password can't be blank"), null)
    else if password isnt passwordConfirmation
      return cb(new Error("Password doesn't match confirmation"), null)
    else
      values =
        password             : GenPassword.createHash(password)
        reset_password_token : null
      @save values, cb

  resetPasswordLink: ->
    "http://#{config.api_host}/password/reset?token=#{@reset_password_token}"

  sendPasswordResetInstructionsEmail: (cb) ->
    cb() if cb

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
