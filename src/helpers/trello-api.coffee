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


config = JSON.parse(fs.readFileSync("config/config.json"))

String.prototype.replaceAll = (params) ->
    return this.replace /{[^{}]+}/g, (key) ->
        return params[key.replace(/[{}]+/g, "")] || ""


module.exports = class TrelloApi
    @host: 'api.trello.com'

    # Abstractified API names
    @endpoints : {
        'all_boards' :          { method: 'GET',  path: '/1/members/{username}/boards?key={key}&token={token}' }
        'all_lists_of_board' :  { method: 'GET',  path: '/1/boards/{board_id}/lists?key={key}&token={token}' }
        'all_cards_of_list' :   { method: 'GET',  path: '/1/lists/{list_id}/cards?key={key}&token={token}' }
        'checklist_of_card':    { method: 'GET',  path: '/1/checklists/{checklist_id}?key={key}&token={token}' }
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
        console.log(action)
        keys = _.keys(paramObj)
        params = {}
        _.each keys, (key) ->
            params[key] = paramObj[key]
        # Must have done OAuth authentiation
        should.exist userObj.trello_username
        should.exist userObj.access_token

        # Common params
        params.username = userObj.trello_username
        params.key      = config.trello.key
        params.token    = userObj.access_token
        #console.log(params)
        
        # Replace the api url variables
        path = TrelloApi.endpoints[action].path.replaceAll(params)
        console.log(path)

        # pstr is for POST only
        pstr = ''
        length = Buffer.byteLength(pstr, 'utf8')
        opts =
            host: TrelloApi.host
            path:  path
            method: TrelloApi.endpoints[action].method
            headers:
                'User-Agent': 'My-First-Trade-Bot'
                'Accept': 'application/json, text/javascript, */*; q=0.01'
                'Content-Type': 'application/x-www-form-urlencoded'
                'Content-Length': length
        #console.log(opts)
        
        request = https.request opts, (resp) ->
            #console.log("statusCode: ", resp.statusCode)
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
    # Collect all Trello data for a user
    #
    # Scenario
    #
    #  Get all boards 
    #   -> list of board IDs
    #      foreach board in boards 
    #         get lists
    #         foreach list in lists
    #            get cards
    #            foreach card in cards
    #               get checklists
    # Data will be saved in the database
    # colection : boards, lists, cards, checklists
    # 
    collect_data: (userObj, fn)->
        db_trellos = new Trellos()
        uid = new ObjectID userObj._id.toString()
        db_trellos.clear_all uid, (err, wtf)=>
            if err
                return fn(500, wtf)
            # Get all boards
            console.log('I am here')
            @request 'all_boards', userObj, {}, (err, json) =>
                if err
                    return fn(500, json)
                # Save boards data
                boards = JSON.parse(json)
                db_trellos.save_boards uid, boards, (err, wtf)=>
                    if err
                        return fn(500,wtf)

                    # Get all lists
                    _.each boards, (board) =>
                        @request 'all_lists_of_board', userObj, {board_id: board.id}, (err, json) =>
                            if err
                                return fn(500, json)
                            # Save lists of a board data
                            lists = JSON.parse(json)
                            db_trellos.save_lists uid, board.id, lists, (err, wtf)=>
                                if err
                                    return fn(500,wtf)
                                # Get all cards
                                _.each lists, (list)=>
                                    @request 'all_cards_of_list', userObj, {list_id: list.id}, (err, json) =>
                                        if err
                                            return fn(500, json)
                                        # Save cards of a list data
                                        #console.log json
                                        cards = JSON.parse(json)
                                        if 0 < cards.length
                                            db_trellos.save_cards uid, board.id, list.id, cards, (err, wtf)=>
                                                if err
                                                    return fn(500,wtf)
                                            # Now save the checklist data
                                            _.each cards, (card)=>
                                                _.each card.idChecklists, (checklistid) =>
                                                    @request 'checklist_of_card', userObj, {checklist_id: checklistid}, (err, json) =>
                                                        if err
                                                            return fn(500, json)
                                                        checklists = JSON.parse(json)
                                                        db_trellos.save_checklists uid, board.id, list.id, card.id, checklists, (err, wtf)=>
                                                            if err
                                                                return fn(500,wtf)
                    fn(null, 'all good')





###
# Users database entry
{ "_id" : ObjectId("51b7e5ebfe8ae46384314ad2"), "access_token" : "7ec5ebd613019a6e5483c88a7eb176382a087e1fe806cd6be94dac29f1e7cbb5", "access_token_secret" : "b40765b097e0669e8673cfe1f7936b2f", "email" : "test1@gmail.com", "password" : "123456", "token_secret" : "48439721d88765dc37373f72d9a06cfb" }

# To get all boards of mine key={developer key} token={users.access_token}
https://api.trello.com/1/member/yoshi1/boards?key=80e7f11a72d431dee0e0db0a52631180&token=7ec5ebd613019a6e5483c88a7eb176382a087e1fe806cd6be94dac29f1e7cbb5
# 
# TO get all cards of a board
https://api.trello.com/1/boards/518078ad821ecf8371001122/cards?key=80e7f11a72d431dee0e0db0a52631180&token=7ec5ebd613019a6e5483c88a7eb176382a087e1fe806cd6be94dac29f1e7cbb5

#Test "allboards" action
http://localhost:3000/app/trello/allboards/test1@yahoo.com

Sample All Board data
[{"id":"50dd7d5b2ef409fa0100128c","name":"Welcome Board","desc":"","closed":false,"idOrganization":null,"invited":false,"pinned":true,"url":"https://trello.com/board/welcome-board/50dd7d5b2ef409fa0100128c","prefs":{"permissionLevel":"private","voting":"members","comments":"members","invitations":"members","selfJoin":false,"cardCovers":true,"canBePublic":true,"canBeOrg":true,"canBePrivate":true,"canInvite":true},"invitations":[],"memberships":[{"id":"50dd7d5b2ef409fa0100128d","idMember":"4e6a7fad05d98b02ba00845c","memberType":"normal","deactivated":false,"unconfirmed":false},{"id":"50dd7d5b2ef409fa01001298","idMember":"50dd7d5b2ef409fa0100128b","memberType":"admin","deactivated":false,"unconfirmed":false}],"shortUrl":"https://trello.com/b/REDaVbxb","subscribed":false,"labelNames":{"red":"","orange":"","yellow":"","green":"","blue":"","purple":""}},
{"id":"516d20677790e4c568001856","name":"WiseHive Test","desc":"","closed":false,"idOrganization":null,"invited":false,"pinned":true,"url":"https://trello.com/board/wisehive-test/516d20677790e4c568001856","prefs":{"permissionLevel":"private","voting":"members","comments":"members","invitations":"members","selfJoin":false,"cardCovers":true,"canBePublic":true,"canBeOrg":true,"canBePrivate":true,"canInvite":true},"invitations":[],"memberships":[{"id":"516d20677790e4c56800185a","idMember":"50dd7d5b2ef409fa0100128b","memberType":"admin","deactivated":false,"unconfirmed":false}],"shortUrl":"https://trello.com/b/TLLVLDSP","subscribed":false,"labelNames":{"yellow":"","red":"","purple":"","orange":"","green":"Task","blue":""}},
{"id":"518078ad821ecf8371001122","name":"Yastrology Builds","desc":"","closed":false,"idOrganization":null,"invited":false,"pinned":true,"url":"https://trello.com/board/yastrology-builds/518078ad821ecf8371001122","prefs":{"permissionLevel":"private","voting":"members","comments":"members","invitations":"members","selfJoin":false,"cardCovers":true,"canBePublic":true,"canBeOrg":true,"canBePrivate":true,"canInvite":true},"invitations":[],"memberships":[{"id":"518078ad821ecf8371001126","idMember":"50dd7d5b2ef409fa0100128b","memberType":"admin","deactivated":false,"unconfirmed":false},{"id":"51807d85d6b8609871002cfe","idMember":"51807d85d6b8609871002ca2","memberType":"normal","deactivated":false,"unconfirmed":false},{"id":"5180f4250f8105f80c00356a","idMember":"5180f4240f8105f80c00350e","memberType":"normal","deactivated":false,"unconfirmed":false}],"shortUrl":"https://trello.com/b/S9ZtwHYW","subscribed":false,"labelNames":{"yellow":"Task","red":"Bug fix","purple":"Discussion","orange":"New feature","green":"Info","blue":""}}]
###
