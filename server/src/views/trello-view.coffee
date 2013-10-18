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


Date.prototype.sameDateAs = (pDate) ->
    ((this.getFullYear()==pDate.getFullYear())&&(this.getMonth()==pDate.getMonth())&&(this.getDate()==pDate.getDate()))


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
    collect_cards_per_due: (all_cards, tzdiff) ->
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
                    #if days_diff < 0
                    if due.sameDateAs(now)
                        cardids.today.push card.id  # this id is not mongo ObjectId
                    else
                        if days_diff < 0
                            cardids.past.push card.id  # this id is not mongo ObjectId
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

    # Find cards for a given listId.
    cardsByListId: (data, listId) ->
      cards = _.find data.cards, (card) ->
        card.list_id is listId
      if cards and _.has(cards, 'cards')
        _.map cards.cards, (card) =>
          card.asignee        = @card_member data, card
          card.comments_count = card.badges.comments
          card.due            = if _.isUndefined(card.due)
            'None'
          else
            Date.create(card.due).format "{Mon} {d}, {yyyy} at {h}:{mm} {TT}"

          card
      else
        []

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
    list_cards_dueform: (alldata, cardids, tzdiff, fn) ->
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
            due = Date.create(acard[1].due).addHours(tzdiff)  # Change to localtime
            duedate = due.format "{Mon} {d}, {yyyy} at {h}:{mm} {TT}"
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

    listCardsDueform: (alldata, cardids, tzdiff, fn) ->
      cards = []
      _.each cardids, (cardId) =>
        acard = @lookup_card_by_id alldata, cardId
        # [cards, card]
        aboard = @lookup_board_by_id alldata, acard[0].board_id
        # board
        alist = @lookup_list_by_id alldata, acard[0].board_id, acard[0].list_id
        # [lists, list]

        # Assigned To members
        members = @card_member(alldata, acard[1])
        # Due date format
        due     = Date.create(acard[1].due).addHours(tzdiff)  # Change to localtime
        duedate = due.format "{Mon} {d}, {yyyy} at {h}:{mm} {TT}"
        card    = {
            name:        acard[1].name
            url:         acard[1].url
            board:       aboard.boards.name
            board_url:   aboard.boards.url
            org_name:    aboard.org_name
            list:        alist[1].name
            list_url:    ""
            due:         duedate
            assigned_to: members
        }
        cards.push card
      cards

    actionSummary: (action) ->
      # Action date format
      #adate = Date.create(action.date).addHours(tzdiff)  # Change to localtime
      #actiondate = adate.format "{Mon} {d}, {yyyy} at {h}:{mm} {TT}"
      adate      = Date.create action.date
      actiondate = adate.format "{Mon} {d}, {yyyy} at {h}:{mm} {TT}"

      if action.type is "updateCard"
        actionText = "updated #{action.data.card.name}"
      else if action.type is "createCard"
        actionText = "added #{action.data.card.name} to #{action.data.list.name}"
      else if action.type is "createBoard"
        actionText = "created this board."
      else if action.type is "commentCard"
        actionText = "commented on #{action.data.card.name}, saying #{action.data.text}"
      else if action.type is "addMemberToCard"
        actionText = "added #{action.member.fullName} to #{action.data.card.name}"
      else if action.type is "removeMemberFromCard"
        actionText = "removed #{action.member.fullName} from #{action.data.card.name}"
      else if action.type is "updateBoard"
        actionText = "updated #{action.data.board.name}"
      else if action.type is "createList"
        actionText = "created list #{action.data.list.name}"
      else if action.type is "moveCardToBoard"
        actionText = "moved #{action.data.card.name} from #{action.data.boardSource.name} to #{action.data.board.name}"
      else if action.type is "addAttachmentToCard"
        actionText = "added an attachment to #{action.data.card.name}"
      else if action.type is "addChecklistToCard"
        actionText = "added a Checklist to #{action.data.card.name}"
      else if action.type is "addMemberToBoard"
        actionText = "added a member to #{action.data.board.name}"
      else
        actionText = "took an action"

      full_name : action.memberCreator.fullName
      action    : actionText
      date      : adate.format "{Mon} {d}, {yyyy} {h}:{mm} {TT}"

    #
    # Renders list tables
    # 
    list_tabular: (alldata, lists, tzdiff) ->
        tables = []
        rows = []

        _.each lists.lists, (list) =>
            cards = @lookup_cards_by_listid(alldata, list.id)
            if not _.isUndefined cards
                _.each cards.cards, (card) =>
                    if card.due
                        duedate = (Date.create(card.due)).addHours(tzdiff).format "{Mon} {d}, {h}:{mm} {TT}"
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
                rows = []
                tables.push TrelloView.templates.list_table.template({list_name: list.name, rows: trs})
            else
                tables.push TrelloView.templates.list_table_nocard.template({list_name: list.name})
        html = tables.join('\n')

    #
    # Render an action and return the result html
    # 
    render_action: (action, tzdiff)->
        try
            # Action date format
            adate = Date.create(action.date).addHours(tzdiff)  # Change to localtime
            actiondate = adate.format "{Mon} {d}, {yyyy} at {h}:{mm} {TT}"

            if action.type is "updateCard"
                actionText = "updated #{action.data.card.name}"
            else if action.type is "createCard"
                actionText = "added #{action.data.card.name} to #{action.data.list.name}"
            else if action.type is "createBoard"
                actionText = "created this board."
            else if action.type is "commentCard"
                actionText = "commented on #{action.data.card.name}, saying #{action.data.text}"
            else if action.type is "addMemberToCard"
                actionText = "added #{action.member.fullName} to #{action.data.card.name}"
            else if action.type is "removeMemberFromCard"
                actionText = "removed #{action.member.fullName} from #{action.data.card.name}"
            else if action.type is "updateBoard"
                actionText = "updated #{action.data.board.name}"
            else if action.type is "createList"
                actionText = "created list #{action.data.list.name}"
            else if action.type is "moveCardToBoard"
                actionText = "moved #{action.data.card.name} from #{action.data.boardSource.name} to #{action.data.board.name}"
            else if action.type is "addAttachmentToCard"
                actionText = "added an attachment to #{action.data.card.name}"
            else if action.type is "addChecklistToCard"
                actionText = "added a Checklist to #{action.data.card.name}"
            else if action.type is "addMemberToBoard"
                actionText = "added a member to #{action.data.board.name}"
            else
                actionText = "took an action"

            context = {
                full_name: action.memberCreator.fullName
                action: actionText
                date: adate.format "{Mon} {d}, {yyyy} {h}:{mm} {TT}"
            }
            TrelloView.templates.action.template(context)
        catch err 
            logtext = "Exception in TrelloView.prototype.render_actions\n"
            if action.type
                logtext += "Action Type = " + action.type + "\n"
            if action.data.board.name
                logtext += "Board Name = " + action.data.board.name + "\n"
            if action.user_id
                logtext += "User = " + action.user_id + "\n"
            if action.id
                logtext += "Action ID = " + action.id + "\n"
            console.log logtext + err

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

    getReports: (userId, fn) ->
      new Trellos().get_all_data userId, (err, data) =>
        if err
          fn err, null
        else
          reports =
            due    : {}
            boards : []

          dueCards          = @collect_cards_per_due data.cards
          reports.due.today = @listCardsDueform data, dueCards.today
          reports.due.soon  = @listCardsDueform data, dueCards.soon
          reports.due.past  = @listCardsDueform data, dueCards.past

          # For each of the organizations
          _.each @all_org_names(data), (organization) =>
            boards = _.filter data.boards, (board) =>
              board.org_name is organization

            # For each of the boards for the current organization
            _.each boards, (board) =>
              recentActivity = _.map @recent_actions(data, board.boards.id), (action) =>
                @actionSummary action

              allLists = _.filter data.lists, (list) =>
                list.board_id is board.boards.id

              lists = []
              _.each allLists, (list) =>
                _.each list.lists, (innerList) =>
                  innerList.cards = @cardsByListId(data, innerList.id)
                  lists.push innerList

              reports.boards.push
                id              : board.boards.id
                name            : board.boards.name
                organization    : organization
                lists           : lists
                recent_activity : recentActivity

          fn null, reports

    #
    # Reads all data from DB and render (create) HTML for the data
    #
    # trellos: Trellos object
    # user_id: user_id in ObjectID type
    # fn: callback fn(err, html)
    # 
    renderHtml: (trellos, user, fn) ->
        user_id = new ObjectID(user._id.toString())
        trellos.get_all_data user_id, (err, all) =>
            if err
                fn(500, all)
            else
                htmls = []

                # Due stat
                wtf = @collect_cards_per_due all.cards, user.tzdiff  # DEBUG
                #console.log(wtf)
                htmls.push '<h5><i>Due Today</i></h5>'
                htmls.push @list_cards_dueform all, wtf.today, user.tzdiff
                htmls.push '<h5><i>Due Soon</i></h5>'
                htmls.push @list_cards_dueform all, wtf.soon, user.tzdiff
                htmls.push '<h5><i>Past Due</i></h5>'
                htmls.push @list_cards_dueform all, wtf.past, user.tzdiff
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
                            ret += @render_action(a, user.tzdiff)

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
                            ret += @list_tabular all, lists, user.tzdiff
                ret += "<br>"
                fn(null, ret)

    #
    # get the summary of all Trello board data.
    # Returns HTML
    # user: user object
    # 
    getSummary: (user, fn) ->
        trellos = new Trellos()
        @renderHtml trellos, user, fn
        

    #
    # Checks card due is within limit minutes
    # 
    is_due_soon: (card, limit) ->
        if card.due is null  # If due is null, not need categorization
            no
        else
            due = new Date(card.due)
            now = new Date()
            diff = due.getTime() - now.getTime()  # diff in milli sec
            minutes = Math.abs(diff / 1000 / 60)
            #console.log(card.name+" minutes diff="+minutes+" due="+due)
            if minutes < limit
                yes
            else
                no

    #
    # Get html for due now cards for arg lists
    # 
    card_due_notification: (alldata, lists, tzdiff) ->
        htmls = []

        _.each lists.lists, (list) =>
            cards = @lookup_cards_by_listid(alldata, list.id)
            if not _.isUndefined cards
                _.each cards.cards, (card) =>
                    if @is_due_soon(card,15)
                        aboard = @lookup_board_by_id alldata, cards.board_id
                        # board
                        # Assigned To members
                        members = @card_member(alldata, card)
                        # Due date format
                        due = Date.create(card.due).addHours(tzdiff)  # Change to localtime
                        duedate = due.format "{Mon} {d}, {yyyy} at {h}:{mm} {TT}"
                        context = {
                            board_name:  aboard.boards.name
                            board_url:   aboard.boards.url
                            org_name:    aboard.org_name
                            list_name:   list.name
                            list_url:    ""
                            card_name:   card.name
                            card_url:    card.url
                            due:         duedate
                            assigned_to: members
                        }
                        htmls.push TrelloView.templates.duecard.template(context)
        if htmls.length > 0
            htmls.join('\n')
        else
            null

    #
    # Creates html for due now cards
    # 
    all_card_due_notifications: (all, user, fn)->
        ret = ''
        orgs = @all_org_names(all)
        _.each orgs, (org) =>
            boards_for_org = _.filter all.boards, (bd) =>
                bd.org_name is org  # _.filter iterator
            _.each boards_for_org, (board) =>
                lists = _.filter all.lists, (list) =>
                    list.board_id is board.boards.id
                # Lists
                _.each lists, (lists) =>
                    dd = @card_due_notification all, lists, user.tzdiff
                    if dd isnt null
                        ret += "<br><h4><i>Board: #{org} / #{board.boards.name}</i></h4>"+dd  
        ret





