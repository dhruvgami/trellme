#
#  mailservice.coffee
#
#
fs         = require 'fs'
_          = require 'underscore'
mandrill   = require('node-mandrill')('rOpF3MDFRDN55QV07ypMzA')
TrelloApi  = require './trello-api'
TrelloView = require '../views/trello-view'
handlebars = require 'handlebars'
config     = JSON.parse(fs.readFileSync("config/config.json"))




module.exports = class MailService
    @subject: null
    @from_address: null
    @template_path: 'mail-report.tmpl'
    @template: null

    #
    # Constrcut
    # 
    constructor: () ->
        if MailService.subject is null
            MailService.subject = config.mail.subject
            MailService.from_address = config.mail.fromAddress
            # Email template
            tmpl = fs.readFileSync(__dirname + '/' + MailService.template_path)
            MailService.template = handlebars.compile(tmpl.toString())            

    #
    # Send an email thru Mandrill
    # 
    send: (text, to_address, subj) ->
        # send an e-mail
        mail = {
            to:         [{email: to_address}]
            from_email: MailService.from_address
            from_name:  "TrellMe"
            subject:    subj
            html:       text
        }
        mandrill '/messages/send', {message: mail}, (error, response) =>
            # uh oh, there was an error
            if error
                console.log(JSON.stringify(error))
            # everything's good, lets see what mandrill said
            else
                #console.log(response)

    #
    # SEnd report to all users in the arg users array
    # 
    send_report: (users) ->
        api = new TrelloApi()
        vb = new TrelloView()
        
        _.each users, (user) =>
            if not _.isUndefined user.access_token
                api.collect_data_sync user, (err, result) =>
                    vb.getSummary user, (err, result) =>
                        # result is the html
                        mailtext = MailService.template({content: result})
                        @send mailtext, user.email, MailService.subject
                        console.log("report sent to #{user.email}")
