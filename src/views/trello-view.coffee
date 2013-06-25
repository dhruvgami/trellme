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
sugar    = require 'sugar'



module.exports = class TrelloView
    @templates: {
        duecard:   { path: 'templates/duecard.tmpl', template: null}
        list_table:{ path: 'templates/list-tabular.tmpl', template: null}
        list_table_nocard:{ path: 'templates/list-tabular-nocard.tmpl', template: null}        
        list_row:  { path: 'templates/list-row.tmpl', template: null}
        action:    { path: 'templates/actions.tmpl', template: null}
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
    # Collect card IDs in an object {past:[], today:[], soon:[]}
    # all_cards: all card data
    # 
    collect_cards_per_due: (all_cards) ->
        cardids = {past:[], today:[], soon:[]}

        _.each all_cards, (cards) =>
            _.each cards.cards, (card) =>
                if card.due # If due is null, not need categorization
                    due = new Date(card.due)
                    now = new Date()
                    days_diff = (due - now) / 86400000
                    #
                    # days_diff < 0 : past due
                    # days_diff >= 0: due not past
                    # days_diff >= 0 and days_diff < 1: due today (less than one day)
                    # days_diff >= 1 and days_diff < 7: due soon
                    #
                    if days_diff < 0
                        cardids.past.push card.id  # this id is not mongo ObjectId
                    else
                        if days_diff < 1
                            cardids.today.push card.id  # this id is not mongo ObjectId
                        else if days_diff < 7
                            cardids.soon.push card.id  # this id is not mongo ObjectId
        cardids

    #
    # Returns a list of all organization names
    # 
    all_org_names: (alldata) ->
        orgs = _.map alldata.boards, (board) =>
            board.org_name
        _.uniq(orgs)

    #
    # Finds card data by card_id
    # 
    lookup_card_by_id: (alldata, card_id) ->
        cr = null
        cards = _.find alldata.cards, (cards) =>
            cr = _.find cards.cards, (card) =>
                card.id is card_id
            not _.isUndefined(cr)
        [cards, cr]

    #
    # Finds cards for a list of list_id
    # 
    lookup_cards_by_listid: (alldata, list_id) ->
        cr = null
        cards = _.find alldata.cards, (cards) =>
            cards.list_id is list_id
        cards
        
    #
    # Finds a board by board ID
    # 
    lookup_board_by_id: (alldata, board_id) ->
        #console.log alldata.boards
        bd = _.find alldata.boards, (board) ->
            board.boards.id is board_id
        bd

    #
    # Finds a list by list ID
    # 
    lookup_list_by_id: (alldata, board_id, list_id) ->
        lst = null
        lists = _.find alldata.lists, (list) =>
            lst = null
            if list.board_id is board_id
                lst = _.find list.lists, (lst) =>
                    lst.id is list_id
            lst isnt null and not _.isUndefined(lst)
        [lists, lst]

    #
    # Get all member names - multiple names are concatnated with a comma char.
    # 
    card_member: (alldata, card) ->
        if 0 < card.idMembers.length
            member_names = []
            _.each card.idMembers, (mem_id) =>
                m = _.find alldata.members, (mem) =>
                    mem_id is mem.member_id
                member_names.push m.name
            members = member_names.join(',')  # member names
        else
            'None'  # no members

    #
    # Create a list of due information
    # cards: one of past, today, soon from collect_cards_per_due() return val.
    #
    list_cards_dueform: (alldata, cardids, fn) ->
        htmls = []
        _.each cardids, (card_id) =>
            acard = @lookup_card_by_id alldata, card_id
            # [cards, card]
            aboard = @lookup_board_by_id alldata, acard[0].board_id
            # board
            alist = @lookup_list_by_id alldata, acard[0].board_id, acard[0].list_id
            # [lists, list]

            # Assigned To members
            members = @card_member(alldata, acard[1])
            # Due date format
            duedate = Date.create(acard[1].due).format "{Mon} {d}, {yyyy} at {h}:{mm} {tt} UCT{tz}"
            context = {
                board_name:  aboard.boards.name
                board_url:   aboard.boards.url
                org_name:    aboard.org_name
                list_name:   alist[1].name
                list_url: ""
                card_name:   acard[1].name
                card_url:    acard[1].url
                due:         duedate
                assigned_to: members
            }
            htmls.push TrelloView.templates.duecard.template(context)
        if cardids.length is 0
            htmls.push '<div>No Cards</div>'
        htmls.join('<br>\n')

    #
    # Renders list tables
    # 
    list_tabular: (alldata, lists) ->
        tables = []
        rows = []

        _.each lists.lists, (list) =>
            cards = @lookup_cards_by_listid(alldata, list.id)
            if not _.isUndefined cards
                _.each cards.cards, (card) =>
                    if card.due
                        duedate = Date.create(card.due).format "{Mon} {d}, {h}:{mm} {TT}"
                    else
                        duedate = "None"
                    context = {
                        card_name: card.name
                        assigned_to: @card_member(alldata, card)
                        due_short: duedate
                        comments: card.badges.comments.toString()
                    }
                    rows.push TrelloView.templates.list_row.template(context)
                trs = rows.join('\n')
                tables.push TrelloView.templates.list_table.template({list_name: list.name, rows: trs})
            else
                tables.push TrelloView.templates.list_table_nocard.template({list_name: list.name})
        html = tables.join('\n')

    #
    # Render an action and return the result html
    # 
    render_action: (action)->
        context = {
            full_name: action.memberCreator.fullName
            action: action.type
            date: Date.create(action.date).format "{Mon} {d}, {yyyy} {h}:{mm} {TT}"
        }
        TrelloView.templates.action.template(context)

    #
    # Get recent actions (max 5)
    # 
    recent_actions: (alldata, board_id) ->
        actions = _.filter alldata.actions, (action) =>
            action.data.board.id is board_id
        sorted = _.sortBy actions, (action) =>
            (new Date(action.date)).getTime()
        len = sorted.length
        if len < 5
            size = len
        else
            size = 5
        (sorted.slice(sorted.length - size, len)).reverse()


    #
    # Reads all data from DB and render (create) HTML for the data
    #
    # trellos: Trellos object
    # user_id: user_id in ObjectID type
    # fn: callback fn(err, html)
    # 
    renderHtml: (trellos, user_id, fn) ->
        trellos.get_all_data user_id, (err, all) =>
            if err
                fn(500, all)
            else
                htmls = []

                # Due stat
                wtf = @collect_cards_per_due all.cards  # DEBUG
                #console.log(wtf)
                htmls.push '<h5><i>Due Today</i></h5>'
                htmls.push @list_cards_dueform all, wtf.today
                htmls.push '<h5><i>Due Soon</i></h5>'
                htmls.push @list_cards_dueform all, wtf.soon
                htmls.push '<h5><i>Past Due</i></h5>'
                htmls.push @list_cards_dueform all, wtf.past
                ret = htmls.join "\n"

                orgs = @all_org_names(all)

                # Title - Board Snapshot
                ret += "<br><h4>Recent Activities</h4>" 
                _.each orgs, (org) =>
                    boards_for_org = _.filter all.boards, (bd) =>
                        bd.org_name is org                        
                    _.each boards_for_org, (board) =>
                        ret += "<br><h4><i>Board: #{org} / #{board.boards.name}</i></h4>"  # Board name
                        actions = @recent_actions(all, board.boards.id)
                        _.each actions, (a) =>
                            ret += @render_action(a)

                # Title - Board Snapshot
                ret += "<br><h4>Boards Snapshot</h4>" 
                # Tabular lists
                _.each orgs, (org) =>
                    boards_for_org = _.filter all.boards, (bd) =>
                        bd.org_name is org
                    _.each boards_for_org, (board) =>
                        lists = _.filter all.lists, (list) =>
                            list.board_id is board.boards.id
                        # Lists
                        ret += "<br><h4><i>Board: #{org} / #{board.boards.name}</i></h4>"  # Board name
                        _.each lists, (lists) =>
                            ret += @list_tabular all, lists
                ret += "<br>"
                fn(null, ret)

    #
    # get the summary of all Trello board data.
    # Returns HTML
    # user: user object
    # 
    getSummary: (user, fn) ->
        trellos = new Trellos()
        @renderHtml trellos, new ObjectID(user._id.toString()), fn
        