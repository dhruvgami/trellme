#
# trellos.coffee
#
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
    # uid: user id in ObjetID
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
    # user_id: user ID in ObjectID type
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
                col.insert { user_id: user_id, board_id: board_id, list_id: list_id, cards: cards}, (err) =>
                    if err
                        return fn(500, null)
                    else
                        fn(null, "save cards success")

    #
    # Save checklists
    # user_id: user ID in ObjectID type
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
    # Get all boards
    # user_id: user ID in ObjectID type
    # 
    get_boards: (user_id, fn) ->
        dbconnection.get_client (err, p_client) =>
            p_client.collection 'boards', (err, col) =>
                if err
                    fn(err, null)
                    return
                col.find {user_id: user_id}, (err, cursor) =>
                    if err
                        return fn(500, "Boards not found")
                    cursor.toArray (err, items) =>
                        #console.log(items)
                        fn(err, items[0])

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
                        fn(err, items[0])

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
                        fn(err, items[0])

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
                        return fn(500, "Checklists not found")
                    cursor.toArray (err, items) =>
                        fn(err, items[0])

