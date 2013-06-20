#
# trello-view.coffee
#
#
#
fs       = require 'fs'
#process  = require 'process'
_        = require 'underscore'
ObjectID = require('mongodb').ObjectID
should   = require 'should'
handlebars = require 'handlebars'
Trellos  = require '../models/trellos'





module.exports = class TrelloView
    @templates: {
        board:     { path: 'templates/boards.tmpl', template: null}
        list:      { path: 'templates/lists.tmpl',  template: null}
        card:      { path: 'templates/cards.tmpl',   template: null}
        checklist: { path: 'templates/checklists.tmpl', template: null}
        checkitem: { path: 'templates/checkitems.tmpl', template: null}
    }
    @template_compiled: false
    
    #
    # Constructor
    # 
    constructor: ->
        if TrelloView.template_compiled isnt yes
            keys = _.keys TrelloView.templates
            _.each keys, (key) =>
                tmpl = fs.readFileSync(__dirname + '/' + TrelloView.templates[key].path)
                TrelloView.templates[key].template = handlebars.compile(tmpl.toString())
            TrelloView.template_compiled = yes


    #
    # Reads all data from DB and render (create) HTML for the data
    #
    # trellos: Trellos object
    # user_id: user_id in ObjectID type
    # fn: callback fn(err, html)
    # 
    renderHtml: (trellos, user_id, fn) ->
        htmls = []
        trellos.get_boards user_id, (err, myboards) =>
            trellos.get_all_lists user_id, (err, mylists) =>
                trellos.get_all_cards user_id, (err, mycards) =>
                    trellos.get_all_checklists user_id, (err, mychecklists) =>                    

                        htmls = []
                        # For all boards
                        _.each myboards, (boardx)=>
                            board = boardx.boards # Real data is one deep down
                            list = _.find mylists, (list)=>
                                list.board_id is board.id   # Find the lists for this board
                            listhtmls = []
                            if not list
                                list = []
                            # Render all lists for this board
                            _.each list.lists, (ll)=>
                                # Find the cards for this list
                                cards1 = _.find mycards, (cards)=>
                                    cards.list_id is ll.id
                                # cards1 can be null
                                if cards1
                                    cardhtmls = []
                                    # And cards for this list
                                    _.each cards1.cards, (cc)=>
                                        
                                        # Find checklists for this card -  there may be multiple cls
                                        cls = _.filter mychecklists, (cl)=>
                                            cl.card_id is cc.id
                                        clhtmls = []
                                
                                        # Loop over each checklist
                                        _.each cls, (cl)->
                                            # And loop over each checkitems
                                            cihtmls = []
                                            _.each cl.checklists.checkItems, (ci)=>
                                                # Render checkitem
                                                cihtml = TrelloView.templates.checkitem.template(ci)
                                                cihtmls.push cihtml
                                            cihtml = cihtmls.join("\n")
                                            cl.checklists.checkItems = cihtml  # Insert checkitems into checklist

                                            # Render checklist
                                            clhtml = TrelloView.templates.checklist.template(cl.checklists)
                                            clhtmls.push clhtml
                                        cc.checklists = clhtmls.join("\n") # Insert checklists into card
                                        # Render card
                                        cardhtml = TrelloView.templates.card.template(cc)
                                        cardhtmls.push cardhtml
                                    ll.cards = cardhtmls.join("\n")  # Insert cards into list
                                # Render list
                                listhtml = TrelloView.templates.list.template(ll)
                                listhtmls.push listhtml
                            board.lists = listhtmls.join("\n")  # Insert list into board
                            # Render board
                            htmls.push TrelloView.templates.board.template(board)
                        ret = htmls.join "\n"
                        #console.log(ret)
                        fn(null, ret)

    #
    # get the summary of all Trello board data.
    # Returns HTML
    # user: user object
    # 
    getSummary: (user, fn) ->
        trellos = new Trellos()
        @renderHtml trellos, new ObjectID(user._id.toString()), fn
        