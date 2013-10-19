#
# app.coffee
#
# TrellMe
#
#
os               = require('os')
cluster          = require('cluster')
express          = require("express")
_                = require("underscore")
fs               = require("fs")
dbconnection     = require("./models/dbconnection")
Users            = require("./models/users")
Tokens           = require("./models/tokens")
Trellos          = require('./models/trellos')
http             = require("http")
path             = require("path")
passport         = require("passport")
LocalStrategy    = require("passport-local").Strategy
TrelloOAuth      = require("./helpers/trello-oauth")
TrelloApi        = require("./helpers/trello-api")
MailService      = require("./helpers/mailservice")
TrelloView       = require("./views/trello-view")
config           = JSON.parse(fs.readFileSync("config/config.json"))

# Database objects
db_users = new Users()


# Allow cross domain for all api
allowCrossDomain = (req, res, next) ->
    res.header 'Access-Control-Allow-Origin', '*'
    res.header 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS'
    res.header 'Access-Control-Allow-Headers', 'Content-Type'
    if req.method is 'OPTIONS'
        res.send 200
    else
        next()

# Maybe move this out of the controller into a model.
# Auth by username(email) and password
passport.use(new LocalStrategy( (username, password, done) ->
  process.nextTick ->
    # TODO: Move should move this out to the model.
    db_users.findByEmail username, (err, user) ->
      if err
        return done(err)
      unless user
        return done(null, false, message: "Unknown user with email #{username}")   # don't ever 'return' keyword!
      unless db_users.verifyPassword(user, password)
        return done(null, false, message: "Invalid password")   # don't ever 'return' keyword!

      done null, user
))

passport.use 'api', new LocalStrategy { usernameField : 'email' }, (email, password, done) ->
  process.nextTick ->
    db_users.findByEmail email, (err, user) ->
      if err
        return done(err)
      unless user
        return done(null, false, message: "Unknown user with email #{email}")
      unless db_users.verifyPassword(user, password)
        return done(null, false, message: "Invalid password")
      done null, user

passport.serializeUser (user, done) ->
  done(null, user._id.toString())

passport.deserializeUser (id, done) ->
  db_users.get id, (err, user) ->
    done err, user

# Middleware to use whenever a route requires users to be authenticated.
authRequired = (req, res, next) ->
 return next() if req.isAuthenticated()
 res.status 401
 res.send 'Unauthorized'

#
# Express environment setup
#
app = express()
app.configure ->
  app.set "port", process.env.PORT or 3000
  app.use express.logger "dev"
  app.use express.favicon()
  app.use express.cookieParser()
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.session { secret : 'change-me-before-going-to-production' }
  app.use passport.initialize()
  app.use passport.session()
  app.use app.router
  app.use express.static(path.join(__dirname, "/../../client"))

app.configure "development", ->
  app.use express.errorHandler()

# # # # # #
# Routes  #
# # # # # #

#
# POST /app/tokens = Login
#  params:
#    username and password
#  Returns a token entry of tokens database
#
app.post "/app/tokens", (req, res, next) ->
  passport.authenticate("local", (err, user, info) =>
    if err
      return next(err)
    if not user
      res.status 401
      return res.send "Unauthorized"
    else
      # Test Email
      #(new MailService()).send("Hey what's up dude?", "noda.yoshikazu@gmail.com")
      tokens = new Tokens()
      tokens.create user, (err, tk) =>
        res.status 200
        return res.json tk[0]
  )(req, res, next)

# - Log the user in - #
app.post('/login', passport.authenticate('api'), (req, res) ->
  tokens = new Tokens()
  tokens.create req.user, (err, tk) ->
    res.json tk[0]
)

# - Log the user out a.k.a. destroy session - #
app.delete '/logout', (req, res) ->
  req.logout()
  res.status 204
  res.send ''

# - Retrieve logged in user information - #
# Note: We use this enpoint to bootstrap the AngularJS application.
#       When the user loads the page the applications sends a request to this
#       route and, if there is an active session, this will return a 200 status
#       code, along with the current logged in user's information. If there is
#       no session then this will return 401 and the user will be prompted its
#       credentials.
app.get('/me', authRequired, (req, res) ->
  res.json req.user
)

# - Retrieve user settings - #
app.get '/settings', authRequired, (req, res) ->
  res.json req.user.settings

app.post '/settings', authRequired, (req, res) ->
  db_users.saveUserSettings req.user.id, req.body, (err, user) ->
    if err
      res.status 500
      res.send err
    else
      res.status 201
      res.send ''

#
# DELETE /app/tokens == Logout
# Logout
#   params: token
#
app.delete "/app/tokens/(([A-Za-z0-9_]+))", (req, res) ->
    #
    # This is how you validate the access token.
    #  If ok is not null, it has been validated, and ok is null otherwise.
    #
    console.log(req.body)
    tk = new Tokens()
    tk.validate req.params[0], (err, ok) =>
        if err
            res.status 401
            res.send "Invalid token or token had expired"
        else
            if ok is null
                res.status 401
                res.send "Invalid token or token had expired"
            else
                tk.delete req.params[0], (err, wtf)->
                    if err
                        res.status err
                        res.send wtf
                    else
                        res.status 200
                        res.send "You have signed out"
#
# Login Form (for debugging purpose only)
#
app.get "/app/login", (req, res) ->
    login_form = '<form action="/app/tokens" method="post">'+
        '<div><label>Email:</label><input type="text" name="username"/></div>'+
        '<div><label>Password:</label><input type="password" name="password"/></div>'+
        '<div><input type="submit" value="Login"/></div></form>'
    res.status 200
    res.send (login_form)

#
# Logout form (for debugging purpose only)
#
app.get "/app/logout", (req, res) ->
    logout_form = '<form action="/app/tokens" method="post">'+
        '    <div><label for="token">Token:</label><input type="text" name="token" id="token" /></div>'+
        '    <input type="submit" value="Logout"/>' +
        '    <input type="hidden" id="_method" name="_method" value="delete" />' +
        '</form>'
    res.status 200
    res.send (logout_form)

#
# Sign up form
#
app.get "/app/signup", (req, res)->
    signup_form = '<form action="/app/users" method="post">'+
    '    <div><label for="email">Email(loginID):</label><input type="text" name="email" id="email" /></div>'+
    '    <div><label for="password">Password:</label><input type="password" name="password" id="password" /></div>'+
    '    <div><label for="trello_username">Trello User Name:</label><input type="text" name="trello_username" id="trello_username" /></div>'+
    '    <input type="submit" value="Submit"/>'+
    '</form>'
    res.send (signup_form)


#=================================================
# Users API
#  email, password, name, Trello-username, misc(can be any char string)

#
# Sign-up
#   No token is needed for this endpoint
#   data: email, password, trello_username, tzdiff
#
app.post "/app/users",  (req, res) ->
    #console.log(req.body)
    db_users.add req.body, (err, result) =>
        if err
            res.status err
            res.send result
        else
            res.status 200
            res.send "OK"

#
# Remove a user by username (email)
#   query string token={token}
#
app.delete "/app/users", (req, res) ->
    (new Tokens()).validate req.query['token'], (err, token_record) =>
        if err
            res.status 401; res.json result
        else unless result
            res.status 401; res.json "Invalid token."
        else
            # Token record has user_id
            db_users.remove token_record.user_id, (err, result) =>
                if err
                    res.status err
                    res.send result
                else
                    res.status 200
                    res.send "Delete the user"


#=================================================
#
# Trello API
#
#=================================================
#
# Trello OAuth API
#  URL param is the user email
#
app.get "/app/auths/request/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
    db_users.findByEmail req.params[0], (err, user)=>
        if err
            res.status 401; res.send "No such user"
        else
            toa = new TrelloOAuth(user._id.toString())
            toa.createOAuth (err, oauth) =>
                if err
                    res.status err; res.send oauth   # message
                else
                    toa.requestToken (err, redirect_url) =>
                        if not err
                            res.status 302
                            res.redirect redirect_url # encodeURI not needed
                        else
                            # requestToken Error
                            res.status 500; res.json redirect_url  # message

#
# Trello OAuth callback
# Redirect URL from Trello
#
app.get "/app/auths/trello_callback", (req, res) ->
    if typeof req.query.oauth_verifier isnt 'undefined'
        toa = new TrelloOAuth(req.query.state)
        toa.createOAuth (err, oauth) =>
            toa.callbackCalled oauth, req.query, (err, resp) =>
                if err
                    res.status 500; res.send '<script>window.close();</script>'
                else
                    res.status 200; res.send '<script>window.close();</script>' # All good!!

    else if typeof req.query.denied isnt 'undefined'
        res.status 200; res.send '<script>window.close();</script>'
    else
        res.status 404; res.send '<script>window.close();</script>'

#
# Get OAuth result
#
app.get "/app/auths/status/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
    db_users.findByEmail {username: req.params[0]}, (err, user)=>
        if err
            res.status 401; res.send "No such user"
        else
            if _.isUndefined(users.access_token)
                stat = "no"
            else
                stat = "yes"
            res.status 200
            res.send   stat

#
# Revoke Trello oauth - Remove access_token from user.
#
app.delete '/app/auths/delete', (req, res)->
    null



#
# Trello API access test APIs
#

###
# Collect all data test execution API
#
#app.get "/app/trello/report/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
#    db_users.findByEmail {username: req.params[0]}, (err, user)=>
#        if err
#            res.status 404; res.send "No such user"
#        else
#            console.log(user)
#            (new TrelloApi()).collect_data_sync user, (err, result) =>
#                if err
#                    res.status err
#                    res.send result
#                else
#                    (new TrelloView()).getSummary user, (err, result) =>
#                        if err
#                            res.status 500
#                            res.send "getSummary failed"
#                        else
#                            res.status 200
#                            res.send result  # html
#
# Trash these later
#app.get "/app/trello/collecttest/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
#    db_users.findByEmail {username: req.params[0]}, (err, user)=>
#        if err
#            res.status 404; res.send "No such user"
#        else
#            (new TrelloApi()).collect_data_sync user, (err, result) =>
#                if err
#                    res.status err
#                    res.send result
#                else
#                    res.status 200
#                    res.send result
#
#app.get "/app/trello/viewtest/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
#    db_users.findByEmail {username: req.params[0]}, (err, user)=>
#        if err
#            res.status 404; res.send "No such user"
#        else
#            (new TrelloView()).getSummary user, (err, result) =>
#                if err
#                    res.status err
#                    res.send result
#                else
#                    res.status 200
#                    res.send result  # HTML

###
#
# Collect Trello summary
# url param = token
#
app.get "/app/trello/collect", authRequired, (req, res) ->
  (new TrelloApi()).collect_data_sync req.user, (err, result) =>
    if err
      res.status err
      res.send result
    else
      res.status 200
      res.send result

#
# Get the view (html) of the Trello summary
# url param is token
#
app.get "/app/trello/view", authRequired, (req, res) ->
  new TrelloView().getSummary req.user, (err, result) ->
    if err
      res.status err
      res.send result
    else
      res.status 200
      res.send result  # HTML <- Why? this is an API.

# Get the reports summary JSON.
# Authentication required as the reports are scoped to the logged in user.
app.get "/app/trello/reports", authRequired, (req, res) ->
  # First we need to fetch the results from Trello. Then pull the reports from db.
  new TrelloView().getReports req.user._id, (err, result) ->
    if err
      res.status 500
      res.send err
    else
      res.send result

###
# For Debugging only
#
#app.get "/app/trello/orgboards/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
#    db_users.findByEmail {username: req.params[0]}, (err, user)=>
#        if err
#            res.status 404; res.send "No such user"
#        else
#            #console.log(user)
#            (new TrelloApi()).get_all_boards (new Trellos()), user, (err, result) =>
#                if err
#                    res.status err
#                    res.send result
#                else
#                    res.status 200
#                    res.send result  # HTML
###

# Get Trello stuff of a user
#   First param: boards, lists, cards
#   Second param: username (email)
#
app.get "/app/trello/((\\w+))/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
    db_users.findByEmail {username: req.params[1]}, (err, user)=>
        if err
            res.status 404; res.send "No such user"
        else
             (new TrelloApi()).request req.params[0], user, {}, (err, result) =>
                if err
                    res.status err
                    res.send result
                else
                    res.status 200
                    res.send result  # Already JSON
#=================================================

# Update Board data on demand
#

app.get "/app/update", (req, res) ->
    # updateservice = new UpdateService()
    mailservice = new MailService()
    console.log('Update starting...')
    db_users.findAll (err, users) =>
        if err
            res.status err
            res.send "Error updating reports"
        else
            # updateservice.update_report(users)
            mailservice.send_report(users)
            res.status 200
    console.log('Update complete')
    res.send "OK"


#
# mainLoop sends regular once a day report to users.
#
# mailLoop = () ->
#    mailservice = new MailService()
#    mloop = setInterval( ()=>
        #
        # for all users in users collection
        #   do
        #     create report
        #     send report
        #     set user.lastreport = now()
        # end
        #
#        console.log('Mailing starting')
#        db_users.findAll (err, users) =>
#            mailservice.send_report(users)

#    ,config.mail_interval)    # 1000*24*60*60 = Do every 24 hours???

#
# Due notification mail loop
#
notificationLoop = () ->
    mailservice = new MailService()
    trellos = new Trellos()
    trelloView = new TrelloView()

    nloop = setInterval( () =>
        #
        # for all users in users
        #   check database for cards that due is within 15 minutes from now.
        #   if there is one
        #      Send email notifying the card is due now.
        #
        # * note that this loop will not read from API. Checks only the database
        #   contents.
        #
        db_users.findAll (err, users) =>
            _.each users, (user) =>
                trellos.get_all_data user._id, (err, all)=>
                    result = trelloView.all_card_due_notifications(all, user)
                    if result isnt ''
                        mailtext = MailService.template({content: result})
                        mailservice.send mailtext, user.email, config.mail.due_notify_subject
                        console.log("Due notification sent to #{user.email}")
    ,1000*10*60)    # Do every 10 minutes


#
# Server with Cluster
#
if (cluster.isMaster)

    for i in [1..2]   # Specify the number of workers you want to create
        cluster.fork()
    cluster.on 'exit', (worker, code, signal) ->
        exitCode = worker.process.exitCode
        console.log('worker ' + worker.process.pid + ' died ('+exitCode+'). restarting...')
        cluster.fork()
    cluster.on 'online', (worker) ->
        console.log("worker("+worker.id+").online " + worker.process.pid)
    cluster.on 'listening', (worker, address) ->
        console.log("worker("+worker.id+").listening " + address.address + ":" + address.port)

    # Only Master listens to input
    server = http.createServer(app)
    server.listen(app.get('port'))

else if (cluster.isWorker)
    # Worker process
    console.log("worker("+cluster.worker.id+")")
#    if cluster.worker.id is 1
#         mailLoop()
    if cluster.worker.id is 2
        notificationLoop()
