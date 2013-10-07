#
# trello-api.coffee
#
#  Trello API accessors
#
# 
_     = require 'underscore'
fs    = require("fs")
https = require('https')
Users = require('../models/users')
Trellos = require('../models/trellos')
should = require('should')
ObjectID = require('mongodb').ObjectID
async = require 'async'



config = JSON.parse(fs.readFileSync("config/config.json"))

String.prototype.replaceAll = (params) ->
    return this.replace /{[^{}]+}/g, (key) ->
        return params[key.replace(/[{}]+/g, "")] || ""


module.exports = class TrelloApi
    @host: 'api.trello.com'

    # Abstractified API names
    @endpoints : {
        'public_boards' :       { method: 'GET',  path: '/1/members/{username}/boards?key={key}&token={token}' }
        'organizations' :       { method: 'GET',  path: '/1/members/{username}/organizations?key={key}&token={token}' }
        'org_boards' :          { method: 'GET',  path: '/1/organizations/{orgname}/boards?key={key}&token={token}' }
        'all_lists_of_board' :  { method: 'GET',  path: '/1/boards/{board_id}/lists?key={key}&token={token}' }
        'all_cards_of_list' :   { method: 'GET',  path: '/1/lists/{list_id}/cards?key={key}&token={token}' }
        'checklist_of_card':    { method: 'GET',  path: '/1/checklists/{checklist_id}?key={key}&token={token}' }
        'member_name' :         { method: 'GET',  path: '/1/member/{member_id}/fullName?key={key}&token={token}' }
        'board_actions':        { method: 'GET',  path: '/1/boards/{board_id}/actions?key={key}&token={token}' }
        'member_notifications': { method: 'GET',  path: '/1/members/{username}/notifications?key={key}&token={token}' }
        'member_actions':       { method: 'GET',  path: '/1/members/{username}/actions?key={key}&token={token}' }
    }
    
    #
    # Initialize
    # 
    constructor: ()->
        @
    
    #
    # Execute API request
    # 
    #  paramObj: params if any like card_id, board_id, list_id, etc
    #  userObj: an user entry from users collection.
    #  
    request: (action, userObj, paramObj, fn)->
        if typeof TrelloApi.endpoints[action] is 'undefined'
            fn(500, "No such action")

        keys = _.keys(paramObj)
        params = {}
        _.each keys, (key) ->
            params[key] = paramObj[key]
        # Must have done OAuth authentiation
        if _.isUndefined(userObj.trello_username) or _.isUndefined(userObj.access_token)
            fn(500, "Access token not available")
            
        # Common params
        params.username = userObj.trello_username
        params.key      = config.trello.key
        params.token    = userObj.access_token
        
        # Replace the api url variables
        path = TrelloApi.endpoints[action].path.replaceAll(params)
        #console.log(path)

        # pstr is for POST only
        pstr = ''
        length = Buffer.byteLength(pstr, 'utf8')
        opts =
            host: TrelloApi.host
            path:  path
            method: TrelloApi.endpoints[action].method
            headers:
                'User-Agent': 'My Trello Bot'
                'Accept': 'application/json, Text/javascript, */*; q=0.01'
                'Content-Type': 'application/x-www-form-urlencoded'
                'Content-Length': length
        # Send request        
        request = https.request opts, (resp) ->
            resp.setEncoding('utf8')
            data = ''
            # On data
            resp.on 'data', (chunk) ->
                data += chunk
            # On end
            resp.on 'end', () ->
                #console.log(data)
                fn(null, data)
            # On error
            resp.on 'error', (e) ->
                console.log('error of some kind '+e)
                fn(500, 'error')
        request.write(pstr)
        request.end()

    #
    # Parse JSON text
    # 
    _parse: (json) ->
        try
            obj = JSON.parse(json)
        catch err
            #console.log('JSON Parse Error '+json)
            obj = {}
        obj

    #
    # Read organization boards and public boards for the user 
    # db: Trellos instance
    # userObj: user document
    # Returns: array of board data
    # 
    get_all_boards: (db, userObj, fn)->
        #
        # Get all organization names
        # 
        @request 'organizations', userObj, {}, (err, json) =>
            if err
                fn(500, json)
                return
            orgs = @_parse(json)  # organizations array
            uid = new ObjectID(userObj._id.toString())
            allboards = []
            async.each( orgs, (org, cb) =>
                #
                # Get organization boards
                # 
                @request 'org_boards', userObj, {orgname:org.name}, (err, json) =>
                    if err
                        fn(500, json)
                        return
                    boards = @_parse(json)  # Boards belongs to the organization
                    # boards is an array.
                    # Store boards individually
                    async.each( boards, (board, cb1) =>
                        # No board redundancy
                        bb = _.find allboards, (bd) =>
                            board.id is bd.id
                        if typeof bb is 'undefined'
                            allboards.push board  # Push only one that isn't already there
                         
                        cb1(null)
                    , (err)=>
                        # Save data into db. Pass org name
                        db.save_boards uid, org.name, boards, (err, wtf)=>
                            if err
                                fn(500,wtf)
                                return
                            cb(null)
                    )
            , (err) =>
                #
                # Finally read all public board data
                # 
                @request 'public_boards', userObj, {}, (err, json) =>
                    if err
                        return fn(500, json)
                    boards = @_parse(json)
                    # Store boards individually
                    async.each( boards, (board, cb2) =>
                        # No board redundancy
                        bb = _.find allboards, (bd) =>
                            board.id is bd.id
                        if typeof bb is 'undefined'
                            allboards.push board  # Push only one that isn't already there
                        cb2(null)
                    , (err) =>
                        db.save_boards uid, "public", boards, (err, wtf)=>
                            if err
                                return fn(500,wtf)                
                            #console.log(allboards)
                            fn(null, allboards)
                    )
            )

    #
    # read public boards only
    # db: Trellos instance
    # userObj: user document
    # Returns: array of public board data
    #
    get_public_boards: (db, userObj, fn)->
        @request 'public_boards', userObj, {}, (err, json) =>
            if err
                return fn(500, json)
            boards = @_parse(json)
            uid = new ObjectID(userObj._id.toString())
            db.save_boards uid, "public", boards, (err, wtf)=>
                if err
                    return fn(500,wtf)                
                fn(null, boards)

    #
    # read all lists for the arg board
    # db: Trellos instance
    # userObj: user document
    # board: parent board of lists
    # Returns: array of list
    # 
    get_all_lists_of_board: (db,userObj, board, fn)->
        @request 'all_lists_of_board', userObj, {board_id: board.id}, (err, json) =>
            if err
                return fn(500, json)
            lists = @_parse(json)
            uid = new ObjectID(userObj._id.toString())
            db.save_lists uid, board.id, lists, (err, wtf)=>
                if err
                    return fn(500,wtf)            
                fn(null, lists)

    #
    # read all cards for the arg list
    # db: Trellos instance
    # userObj: user document
    # board_id: parent board ID
    # list: parent list
    # Returns: array of cards
    #
    get_all_cards_of_list: (db, userObj, board_id, list, fn) ->
        @request 'all_cards_of_list', userObj, {list_id: list.id}, (err, json) =>
            if err
                return fn(500, json)
            cards = @_parse(json)
            uid = new ObjectID(userObj._id.toString())
            db.save_cards uid, board_id, list.id, cards, (err, wtf)=>
                if err
                    return fn(500, wtf)            
                fn(null, cards)

    #
    # read all checklists for the arg card
    # db: Trellos instance
    # userObj: user document
    # board_id: parent board ID
    # list_id: parent list ID
    # card_id: parent card ID
    # Returns: array of checklists
    #
    get_checklist_of_card: (db, userObj, board_id, list_id, card_id, checklistid, fn) ->
        @request 'checklist_of_card', userObj, {checklist_id: checklistid}, (err, json) =>
            if err
                return fn(500, json)
            checklists = @_parse(json)
            uid = new ObjectID(userObj._id.toString())
            db.save_checklists uid, board_id, list_id, card_id, checklists, (err, wtf)=>
                if err
                    return fn(500,wtf)            
                fn(null, checklists)

    #
    # Get member full name from ID
    # db: Trellos instance
    # userObj: user document
    # member_id: member ID
    # 
    get_member_name: (db, userObj, member_id, fn) ->
        should.exist(member_id)
        @request 'member_name', userObj, {member_id: member_id}, (err, json) =>
            if err
                return fn(500, json)
            name = @_parse(json)  # will be like {"_value":"Yoshikazu Noda"} 
            uid = new ObjectID(userObj._id.toString())
            db.save_member uid, member_id, name, (err, wtf)=>
                if err
                    return fn(500,wtf)
                fn(null, name)

    #
    # Get actions pertaining to the board of arg board_id
    # db: Trellos instance
    # userObj: user document
    # board_id: board ID
    # 
    get_board_actions: (db, userObj, board_id, fn) ->
        should.exist(board_id)
        @request 'board_actions', userObj, {board_id: board_id}, (err, json) =>
            if err
                return fn(500, json)
            actions = @_parse(json)  # will be like {"_value":"Yoshikazu Noda"} 
            uid = new ObjectID(userObj._id.toString())
            db.save_actions uid, actions, (err, wtf)=>
                if err
                    return fn(500,wtf)
                fn(null, actions)

    #
    # Collect all trello data for the arg user and store the data in database.
    # The callback fn is called only after every reading and saving is over.
    # This is kind of sync function. I made it that way because rendering can not
    # happen when data collection is immature.
    # Nested async construct is really nasty but I couldn't find any other way now.
    #
    # userObj: user document
    # fn: callback function to be called after done
    # 
    collect_data_sync: (userObj, fn)->
        db = new Trellos()
        uid = new ObjectID(userObj._id.toString())

        db.clear_all uid, (err, wtf)=>
            if err
                fn(500, wtf)
                return                
            # Get all BOARDS
            @get_all_boards db, userObj, (err, boards)=>
                if err
                    fn(err, boards)
                    return
                # Loop over each board
                async.each( boards, (board, cb1)=>
                    # Load all board actions
                    @get_board_actions db, userObj, board.id, (err, actions) =>
                        if err
                            fn(err, actions)
                            return
                        #console.log(actions)
                    # Load all lists for this board
                    @get_all_lists_of_board db, userObj, board, (err, lists)=>
                        if err
                            fn(err, lists)
                            return
                        # Get all CARDS for the list
                        async.each( lists, (list, cb2)=>
                            @get_all_cards_of_list db, userObj, board.id, list, (err, cards) =>
                                if err
                                    fn(err, cards)
                                    return
                                # Now load and save the member data
                                async.eachSeries( cards, (card, cb3)=>
                                    #
                                    async.each( card.idMembers, (member_id, cb5)=>
                                        @get_member_name db, userObj, member_id, (err, name) =>
                                            if err
                                                fn(err, name)
                                                return
                                            cb5(null)
                                    ,(err)=>
                                        cb3(null)
                                    )
                                ,(err)=>
                                    cb2(null)
                                )
                        ,(err)=>
                            cb1(null)
                        )
                ,(err)=>
                    fn(null, 'all good')  # at the end of each boards loop
                )

