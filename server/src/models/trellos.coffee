#
# trellos.coffee
#
#
#
mongodb   = require 'mongodb'
ObjectID  = require('mongodb').ObjectID
dbconnection = require './dbconnection'
should    = require 'should'
_         = require 'underscore'
async     = require 'async'


module.exports = class Trellos extends dbconnection

  #
  # Constructor
  #
  constructor: ->
    super()

  # Update a board
  # boardId: Either String or ObjectID
  updateBoard: (boardId, attrs, cb) ->
    boardId = new ObjectID(boardId) if typeof boardId is 'string'
    dbconnection.get_client (err, p_client) ->
      return cb(err, null) if err
      p_client.collection 'boards', (err, collection) ->
        if err
          return cb(err, null)
        collection.findAndModify { _id : boardId }, null, { $set : attrs }, { new : true }, cb
  #
  # Save member data related to a user
  # user_id: user ID in ObjectID type
  #
  save_member: (user_id, member_id, name, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'members', (err, col) =>
        if err
          return fn(500, null)
        # Check if same ID exists. If so don't insert
        col.findOne { user_id: user_id, member_id: member_id }, (err, wtf) =>
          if err
            return fn(500, null)
          else if wtf isnt null
            return fn(null, "Already there")
          else
            col.insert { user_id: user_id, member_id: member_id, name: name._value }, (err) =>
              if err
                return fn(500, null)
              else
                fn(null, "save member success")

  #
  # Clear all data belongs to the arg user
  #
  # uid: user id in ObjetID
  #
  clear_all: (uid, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'actions', (err, col) =>
        col.remove {user_id: uid}, (err, resp) =>
          if err
            return fn(500, "Failed to remove actions for user #{user_id}")
          p_client.collection 'cards', (err, col) =>
            col.remove {user_id: uid}, (err, resp) =>
              if err
                return fn(500, "Failed to remove cards for user #{user_id}")
              p_client.collection 'lists', (err, col) =>
                col.remove {user_id: uid}, (err, resp) =>
                  if err
                    return fn(500, "Failed to remove lists for user #{user_id}")
                  p_client.collection 'boards', (err, col) =>
                    col.remove {user_id: uid}, (err, resp) =>
                      if err
                        return fn(500, "Failed to remove boards for user #{user_id}")
                      fn(null, "Cleared everything")
  #
  # Save boards
  # user_id: user ID in ObjectID type
  # org_name: name of organization or 'public'
  #
  save_boards: (user_id, org_name, boards, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'boards', (err, col) =>
        if err
          return fn(500, null)

        # Save individually
        _.each boards, (board) =>
          # Check if there is the same board data already. If there is one, they don't insert
          col.find { user_id: user_id, 'boards.id': board.id }, (err, cursor) =>
            cursor.count (err, count) =>
              if count is 0
                data =
                  user_id  : user_id
                  org_name : org_name
                  boards   : board
                  enabled  : !board.closed
                col.insert data, (err) =>
                  if err
                    return fn(500, "Insert failed")
        fn(null, "save board success")

  #
  # Save lists data for a board
  # user_id: user ID in ObjectID type
  #
  save_lists: (user_id, board_id, lists, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'lists', (err, col) =>
        if err
          return fn(500, null)
        col.insert { user_id: user_id, board_id: board_id, lists: lists}, (err) =>
          if err
            return fn(500, null)
          else
            fn(null, "save lists success")


  #
  # Save cards data for a list
  # user_id: user ID in ObjectID type
  #
  save_cards: (user_id, board_id, list_id, cards, fn) ->
    if cards.length is 0
      return fn(null, "nothing to save")
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'cards', (err, col) =>
        if err
          return fn(500, null)
        col.insert { user_id: user_id, board_id: board_id, list_id: list_id, cards: cards }, (err) =>
          if err
            return fn(500, null)
          else
            fn(null, "save cards success")

  #
  # Save checklists
  # user_id: user ID in ObjectID type
  ###
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
  ###

  #
  # Save actions - saves each record individually so we can get by sorting with date
  #
  save_actions: (user_id, actions, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'actions', (err, col) =>
        if err
          return fn(500, null)
        # Save only the recent 10 actions
        actions = actions.slice(0,10)
        _.each actions, (action) =>
          action.user_id = user_id
          col.insert action, (err) =>
            if err
              return fn(500, null)
        fn(null, "save actions success")

  # Get all boards
  # userId: user ID in ObjectID type
  # Returns an array of boards.
  getBoards: (userId, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'boards', (err, col) =>
        if err
          fn(err, null)
          return
        col.find { user_id: userId }, (err, cursor) =>
          if err
            return fn(500, "Boards not found")
          cursor.toArray (err, items) =>
            fn(err, items)

  # Get all boards
  # userId: user ID in ObjectID type
  getEnabledBoards: (userId, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'boards', (err, col) =>
        if err
          fn(err, null)
          return
        col.find { user_id: userId, 'boards.enabled' : true }, (err, cursor) =>
          if err
            return fn(500, "Boards not found")
          cursor.toArray (err, items) =>
            fn(err, items)
  #
  # Get all lists for a user
  # user_id: user ID in ObjectID type
  #
  get_all_lists: (user_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'lists', (err, col) =>
        if err
          fn(err, null)
          return
        col.find {user_id: user_id}, (err, cursor) =>
          if err
            return fn(500, "Lists not found")
          cursor.toArray (err, items) =>
            fn(err, items)

  #
  # user_id: user ID in ObjectID type
  #
  get_all_cards: (user_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'cards', (err, col) =>
        if err
          fn(err, null)
          return
        col.find {user_id: user_id}, (err, cursor) =>
          if err
            return fn(500, "Cards not found")
          cursor.toArray (err, items) =>
            fn(err, items)

 #
  # Get all checklists of a card
  # user_id: user ID in ObjectID type
  #
  get_all_checklists: (user_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'checklists', (err, col) =>
        if err
          fn(err, null)
          return
        col.find {user_id: user_id}, (err, cursor) =>
          if err
            return fn(500, "Checklists not found")
          cursor.toArray (err, items) =>
            fn(err, items)


  #
  # Get lists of a board
  # user_id: user ID in ObjectID type
  #
  get_lists_of_board: (user_id, board_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'lists', (err, col) =>
        if err
          fn(err, null)
          return
        col.find {user_id: user_id, board_id: board_id}, (err, cursor) =>
          if err
            return fn(500, "Lists not found")
          cursor.toArray (err, items) =>
            fn(err, items)

  #
  # Get all cards of a list
  # user_id: user ID in ObjectID type
  #
  get_cards_of_list: (user_id, list_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'cards', (err, col) =>
        if err
          fn(err, null)
          return
        col.find {user_id: user_id, list_id: list_id}, (err, cursor) =>
          if err
            return fn(500, "Cards not found")
          cursor.toArray (err, items) =>
            fn(err, items)

  #
  # Get all checklists of a card
  # user_id: user ID in ObjectID type
  #
  get_checklists_of_list: (user_id, list_id, card_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'checklists', (err, col) =>
        if err
          fn(err, null)
          return
        col.find {user_id: user_id, list_id: list_id, card_id: card_id}, (err, cursor) =>
          if err
            return fn(500, "get_checklists_of_list error")
          cursor.toArray (err, items) =>
            fn(err, items)

  #
  # Find the member of ID
  #  {user_id, member_id, name}
  #
  get_member: (user_id, member_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'members', (err, col) =>
        if err
          fn(err, null)
          return
        col.findOne {user_id: user_id, member_id: member_id}, (err, wtf) =>
          if err
            return fn(500, "get_member error")
          fn(err, wtf)

  #
  # Find all members related to user
  #  {user_id, member_id, name}
  #
  get_all_members: (user_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'members', (err, col) =>
        if err
          fn(err, null)
          return
        col.find {user_id: user_id}, (err, cursor) =>
          if err
            return fn(500, "get_all_members error")
          cursor.toArray (err, items) =>
            fn(err, items)

  #
  # Find all actions belongs to the user
  #
  get_actions: (user_id, board_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'actions', (err, col) =>
        if err
          fn(err, null)
          return
        col.find({user_id: user_id, 'data.board.id': board_id}).sort {date:-1}, (err, cursor) =>
          if err
            return fn(500, "get_actions error")
          cursor.limit 10, (err, cur) =>
            cursor.toArray (err, items) =>
              fn(err, items)  # items is an array

  get_all_actions: (user_id, fn) ->
    dbconnection.get_client (err, p_client) =>
      p_client.collection 'actions', (err, col) =>
        if err
          fn(err, null)
          return
        col.find({user_id: user_id}).sort {date:-1}, (err, cursor) =>
          if err
            return fn(500, "get_actions error")
          cursor.limit 100, (err, cur) =>
            cursor.toArray (err, items) =>
              fn(err, items)  # items is an array

  #
  # Load up all data from DB. This method blocks untill everything is done.
  #
  # user_id: user_id in ObjectID type
  # fn: callback fn(err, all)  all is an object {boards, lists, cards, actions, members}
  #
  get_all_data: (user_id, fn) ->
    all = {}

    # Parallel process
    async.parallel({
      boards: (cb) =>
        @getBoards user_id, (err, myboards) =>
          if err
            cb(500, 'Couldnt read data')
          else
            all.boards = myboards
            cb(null,1)
      lists: (cb) =>
        @get_all_lists user_id, (err, mylists) =>
          if err
            cb(500, 'Couldnt read data')
          else
            all.lists = mylists
            cb(null,2)
      cards: (cb) =>
        @get_all_cards user_id, (err, mycards) =>
          if err
            cb(500, 'Couldnt read data')
          else
            all.cards = mycards
            cb(null,3)
      actions: (cb) =>
        @get_all_actions user_id, (err, myactions) =>
          if err
            cb(500, 'Couldnt read data')
          else
            all.actions = myactions
            cb(null, 4)
      members: (cb) =>
        @get_all_members user_id, (err, mymembers) =>
          if err
            cb(500, 'Couldnt read data')
          else
            all.members = mymembers
            cb(null, 5)
    }, (err, results) =>
      fn(null, all)
    )
