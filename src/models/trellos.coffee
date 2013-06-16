#
# trellos.coffee
#
# We store data as we read from the API. The reason for it is that on memory
# data will explode when multiple users accessed the site at the same time 
#
# boards: {user_id: user-id, boards: [boards data]}
# lists:  {user_id: user-id, board_id: board-id, lists: [lists data]}
#         {user_id: user-id, board_id: board-id, lists: [lists data]}..
# cards:  {user_id: user-id, board_id: board-id, list_id: list-id, cards: [cards data]}
#         {user_id: user-id, board_id: board-id, list_id: list-id, cards: [cards data]}
#         {user_id: user-id, board_id: board-id, list_id: list-id, cards: [cards data]}
# checklists: {user_id: user-id, board_id: board-id, list_id: list-id, card_id: card-id, checklists: [checklist data]}
#         {user_id: user-id, board_id: board-id, list_id: list-id, card_id: card-id, checklists: [checklist data]}
#         {user_id: user-id, board_id: board-id, list_id: list-id, card_id: card-id, checklists: [checklist data]}
#
# 
mongodb = require 'mongodb'
ObjectID = require('mongodb').ObjectID
dbconnection = require './dbconnection'
should = require 'should'


module.exports = class Trellos extends dbconnection

    #
    # Constructor
    # 
    constructor: ->
        super()


    #
    # Clear all data belongs to the arg user
    #
    # uid: user id in string
    # 
    clear_all: (uid, fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'checklists', (err, col) =>
                col.remove {user_id: uid}, (err, resp) =>
                    if err
                        return fn(500, "Failed to remove checklists for user #{user_id}")
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
    #   user_id is a ObjectID
    # 
    save_boards: (user_id, boards, fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'boards', (err, col) =>
                if err
                    return fn(500, null)
                col.insert { user_id: user_id, boards: boards}, (err) =>
                    if err
                        return fn(500, "Insert failed")
                    else
                        fn(null, "save board success")

    #
    # Save lists data for a board
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
    # 
    save_cards: (user_id, board_id, list_id, cards, fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'cards', (err, col) =>
                if err
                    return fn(500, null)
                col.insert { user_id: user_id, board_id: board_id, list_id: list_id, cards: cards}, (err) =>
                    if err
                        return fn(500, null)
                    else
                        fn(null, "save cards success")

    #
    # Save checklists
    # 
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

    #
    # Get board
    # 
    get_boards: (user_id, fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'boards', (err, col) =>
                if err
                    fn(err, null)
                    return
                col.findOne {user_id: user_id}, (err, result) =>
                    fn(err, result)

    #
    get_lists_of_board: (user_id, board_id, fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'lists', (err, col) =>
                if err
                    fn(err, null)
                    return
                col.findOne {user_id: user_id, board_id: board_id}, (err, result) =>
                    fn(err, result)

    #
    get_cards_of_list: (user_id, list_id, fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'cards', (err, col) =>
                if err
                    fn(err, null)
                    return
                col.findOne {user_id: user_id, list_id: list_id}, (err, result) =>
                    fn(err, result)
