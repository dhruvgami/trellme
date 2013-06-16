#
#  trello.coffee
#
#  This module contains the filters to collect final data - card info per list per board
#

_ = require 'underscore'


module.exports = class Trello

    #
    constructor: ->
        @

    #
    # Filter all baords data and returns these
    # 
    # [{id:board_id, name: board_name, closed: true/false},
    #  {id:board_id, name: board_name, closed: true/false},..]
    #
    # Sample All Board data
    # [{"id":"50dd7d5b2ef409fa0100128c","name":"Welcome Board","desc":"","closed":false,"idOrganization":null,"invited":false,"pinned":true,"url":"https://trello.com/board/welcome-board/50dd7d5b2ef409fa0100128c","prefs":{"permissionLevel":"private","voting":"members","comments":"members","invitations":"members","selfJoin":false,"cardCovers":true,"canBePublic":true,"canBeOrg":true,"canBePrivate":true,"canInvite":true},"invitations":[],"memberships":[{"id":"50dd7d5b2ef409fa0100128d","idMember":"4e6a7fad05d98b02ba00845c","memberType":"normal","deactivated":false,"unconfirmed":false},{"id":"50dd7d5b2ef409fa01001298","idMember":"50dd7d5b2ef409fa0100128b","memberType":"admin","deactivated":false,"unconfirmed":false}],"shortUrl":"https://trello.com/b/REDaVbxb","subscribed":false,"labelNames":{"red":"","orange":"","yellow":"","green":"","blue":"","purple":""}},
    filterBoards: (json) ->
        try
            data = JSON.parse json
        catch e
            return null  # Can this happen?

        # data is the parsed json
        boards = []
        _.each data, (board) =>
            b = {
                id: board.id
                name: board.name
                closed: board.closed
            }
            boards.push b
        return boards

    #
    # Output:
    # [{id: list_id, name: list-name, closed: true/false},...]
    # 
    # Sample input:
    # [{"id":"50dd7d5b2ef409fa01001295","name":"Basics","closed":false,"idBoard":"50dd7d5b2ef409fa0100128c","pos":16384,"subscribed":false},{"id":"50dd7d5b2ef409fa01001296","name":"Intermediate","closed":false,"idBoard":"50dd7d5b2ef409fa0100128c","pos":32768,"subscribed":false},{"id":"50dd7d5b2ef409fa01001297","name":"Advanced","closed":false,"idBoard":"50dd7d5b2ef409fa0100128c","pos":49152,"subscribed":false}]
    # 
    filterLists: (json) ->
        try
            data = JSON.parse json
        catch e
            return null  # Can this happen?
        lists = []
        _.each data, (list) =>
            lst = {
                id: list.id
                name: list.name
                closed: list.closed
            }
            lists.push lst
        return lists

    #
    # Output:
    # [ as input ]
    # 
    # Sample input:
    # [{"id":"50dd7d5b2ef409fa010012a4","badges":{"votes":1,"viewingMemberVoted":true,"subscribed":false,"fogbugz":"","due":"2013-06-17T03:00:00.000Z","description":true,"comments":0,"checkItemsChecked":1,"checkItems":3,"attachments":0},"checkItemStates":[{"idCheckItem":"50dd7d5b2ef409fa01001292","state":"complete"}],"closed":false,"dateLastActivity":"2013-06-16T10:10:59.236Z","desc":"WTF!","due":"2013-06-17T03:00:00.000Z","idBoard":"50dd7d5b2ef409fa0100128c","idChecklists":["50dd7d5b2ef409fa01001291"],"idList":"50dd7d5b2ef409fa01001295","idMembers":[],"idMembersVoted":["50dd7d5b2ef409fa0100128b"],"idShort":6,"idAttachmentCover":null,"manualCoverAttachment":false,"labels":[],"name":"... or checklists.","pos":393216,"shortUrl":"https://trello.com/c/H25hSddE","subscribed":false,"url":"https://trello.com/card/or-checklists/50dd7d5b2ef409fa0100128c/6"}
    #
    # "idChecklists" is an array and we need to get data for each checklist.
    #
    # 
    filterCards: (json) ->
        try
            data = JSON.parse json
        catch e
            return null  # Can this happen?
        return data

    #
    # {"id":"50dd7d5b2ef409fa01001291","name":"Checklist","idBoard":"50dd7d5b2ef409fa0100128c","idCard":"50dd7d5b2ef409fa010012a4","pos":16384,"checkItems":[{"state":"complete","id":"50dd7d5b2ef409fa01001292","name":"Make your own boards","pos":16481},{"state":"incomplete","id":"50dd7d5b2ef409fa01001293","name":"Invite your team","pos":33232},{"state":"incomplete","id":"50dd7d5b2ef409fa01001294","name":"Enjoy an ice-cold lemonade","pos":49687}]}
    #
    filterChecklist