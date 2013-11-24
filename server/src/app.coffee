#
# app.coffee
#
# TrellMe
#
#
cluster          = require('cluster')
express          = require("express")
http             = require("http")
passport         = require("passport")
LocalStrategy    = require("passport-local").Strategy
_                = require("underscore")
dbconnection     = require("./models/dbconnection")
Users            = require("./models/users")
Tokens           = require("./models/tokens")
Trellos          = require('./models/trellos')
TrelloOAuth      = require("./helpers/trello-oauth")
TrelloApi        = require("./helpers/trello-api")
MailService      = require("./helpers/mailservice")
TrelloView       = require("./views/trello-view")
config           = require(__dirname + '/../config/config.json')

# Database objects
db_users = new Users()


# Maybe move this out of the controller into a model.
# Auth by username(email) and password
passport.use(new LocalStrategy( (username, password, done) ->
  process.nextTick ->
    Users.findByEmail username, (err, user) ->
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
    Users.findByEmail email, (err, user) ->
      if err
        return done(err)
      unless user
        return done(null, false, message: "Unknown user with email #{email}")
      unless db_users.verifyPassword(user, password)
        return done(null, false, message: "Invalid password")
      done null, user

passport.serializeUser   Users.serialize
passport.deserializeUser Users.deserialize

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
  app.use express.static(__dirname + "/../../client")

app.configure "development", ->
  app.use express.errorHandler()

# # # # # #
# Routes  #
# # # # # #

# - Log the user in - #
app.post '/login', passport.authenticate('api'), (req, res) ->
  tokens = new Tokens()
  tokens.create req.user, (err, tk) ->
    res.json tk[0]

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
app.get '/me', authRequired, (req, res) ->
  res.json req.user

# - Retrieve user settings - #
app.get '/settings', authRequired, (req, res) ->
  Users.getUserSettings req.user._id, (err, settings) ->
    if err
      res.status 500
      res.send err
    else
      res.status 200
      res.json settings

# - Save user settings - #
app.post '/settings', authRequired, (req, res) ->
  Users.saveUserSettings req.user._id, req.body, (err, user) ->
    if err
      res.status 500
      res.send err
    else
      res.status 201
      res.json user.settings

#=================================================
# Users API
#  email, password, name, Trello-username, misc(can be any char string)

#
# Sign-up
#   No token is needed for this endpoint
#   data: email, password, trello_username, tzdiff
#
# TODO: Move db_users.add to a class method.
app.post "/app/users",  (req, res) ->
  db_users.add req.body, (err, result) =>
    if err
      res.status err
      res.send result
    else
      res.status 200
      res.send "OK"

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
  Users.findByEmail req.params[0], (err, user) =>
    if err
      res.status 401
      res.send "No such user"
    else
      toa = new TrelloOAuth(user._id.toString())
      toa.createOAuth (err, oauth) =>
        if err
          res.status err
          res.send oauth # message
        else
          toa.requestToken (err, redirectUrl) =>
            if not err
              res.status 302
              res.redirect redirectUrl # encodeURI not needed
            else
              # requestToken Error
              res.status 500; res.json redirectUrl  # message

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
  Users.findByEmail { username: req.params[0] }, (err, user)=>
    if err
      res.status 401; res.send "No such user"
    else
      if _.isUndefined(users.access_token)
        stat = "no"
      else
        stat = "yes"
      res.status 200
      res.send stat

# Collect Trello summary
app.get "/app/trello/collect", authRequired, (req, res) ->
  new TrelloApi().collect_data_sync req.user, (err, result) =>
    if err
      res.status 500
      res.send err
    else
      res.status 200
      res.json result

#
# Get the view (html) of the Trello summary
# url param is token
#
app.get "/app/trello/view", authRequired, (req, res) ->
  new TrelloView().getSummary req.user, (err, result) ->
    if err
      res.status 500
      res.send err
    else
      res.send result  # HTML <- Why? this is an API.

# Get the reports summary JSON.
# Authentication required as the reports are scoped to the logged in user.
app.get "/app/trello/reports", authRequired, (req, res) ->
  new TrelloView().getReports req.user._id, (err, result) ->
    if err
      res.status 500
      res.send err
    else
      res.json result

# Get Trello stuff of a user
# First param: boards, lists, cards
# Second param: username (email)
# TODO: Refactor this route. There should a route for each of the actions
#       we want the user to be able to perform.
app.get "/app/trello/((\\w+))/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
  Users.findByEmail { username: req.params[1] }, (err, user) =>
    if err
      res.status 404
      res.send "No such user"
    else
       (new TrelloApi()).request req.params[0], user, {}, (err, result) =>
        if err
          res.status 500
          res.send err
        else
          res.json result  # Already JSON

# Update Board data on demand
# TODO: This should not be publicly accessible.
app.get "/app/update", (req, res) ->
  # updateservice = new UpdateService()
  mailservice = new MailService()
  console.log('Update starting...')
  Users.findAll (err, users) =>
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
# Due notification mail loop
#
# TODO: Move this its own model.
notificationLoop = () ->
  mailservice = new MailService()
  trellos     = new Trellos()
  trelloView  = new TrelloView()
  nloop       = setInterval( () =>
    #
    # for all users in users
    #   check database for cards that due is within 15 minutes from now.
    #   if there is one
    #      Send email notifying the card is due now.
    #
    # * note that this loop will not read from API. Checks only the database
    #   contents.
    #
    Users.subscribedUsers (err, users) =>
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
    console.log "worker #{worker.process.id} died (#{exitCode}). Restarting..."
    cluster.fork()
  cluster.on 'online', (worker) ->
    console.log "worker(#{worker.id}) with PID #{worker.process.pid} online."
  cluster.on 'listening', (worker, address) ->
    console.log "worker(#{worker.id}).listening #{address.address}:#{address.port}"

  # Only Master listens to input
  server = http.createServer(app)
  server.listen(app.get('port'))

else if (cluster.isWorker)
  # Worker process
  console.log "worker(#{cluster.worker.id})"
#    if cluster.worker.id is 1
#         mailLoop()
  if cluster.worker.id is 2
    notificationLoop()
