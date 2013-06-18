#
# app.coffee
# 
# Node.js + Express + MongoDB RESTful app skeleton
#  with login API using passport.js
#  API users communicate by access token returned from POST /app/tokens
# 
os               = require('os')
cluster          = require('cluster')
express          = require("express")
_                = require("underscore")
fs               = require("fs")
dbconnection     = require("./models/dbconnection")
Users            = require("./models/users")
Tokens           = require("./models/tokens")
http             = require("http")
path             = require("path")
passport         = require("passport")
LocalStrategy    = require("passport-local").Strategy
TrelloOAuth      = require("./helpers/trello-oauth")
TrelloApi        = require("./helpers/trello-api")
TrelloView       = require("./views/trello-view")


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

# Auth by username(email) and password
passport.use(new LocalStrategy(  (username, password, done) ->
    process.nextTick ->
        db_users.findByEmail {username: username}, (err, user) ->
            if err
                return done(err)
            unless user
                return done(null, false, message: "Unknown user " + username)   # don't ever 'return' keyword!
            unless db_users.verifyPassword(user, password)
                return done(null, false, message: "Invalid password")   # don't ever 'return' keyword!
            done null, user
))

#
# Express environment setup
# 
app = express()
app.configure ->
    app.set "port", process.env.PORT or 3000
    app.use express.favicon()
    app.use express.logger("dev")
    app.use express.bodyParser()
    app.use express.methodOverride()
    app.use allowCrossDomain
    app.use passport.initialize()
    app.use app.router
    app.use express.static(path.join(__dirname, "public"))

app.configure "development", ->
    app.use express.errorHandler()

# Sample API
app.get "/app/users", (req, res) ->
    db_users.findAll (err, all) ->
        res.status 200
        res.json all

#
# POST /app/tokens = Login
#  params:
#    username and password
#  Returns a token entry of tokens database
# 
app.post "/app/tokens", (req, res, next) ->
    #console.log(req.body)
    passport.authenticate("local", {session: false}, (err, user, info) =>
        if err
            return next(err)
        if not user
            res.status 404
            return res.send null
        else
            tokens = new Tokens()
            tokens.create user, (err, tk) =>
                res.status 200
                return res.json tk[0]
    )(req, res, next)


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
#   data: email, password, trello_username
# 
app.post "/app/users",  (req, res) ->
    console.log(req.body)
    db_users.add req.body, (err, result) =>
        if err
            res.status err
            res.send result
        else
            res.status 200
            res.send "OK"

# Remove a user by username (email)
#   post param: token
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

###
# Update user data
#   url param = email
app.put "/app/users/((.+))"

# Get user
#   query string = token={token}
#   url param = email
app.get "/app/users/((.+))"
###

#
#
# 
#=================================================
# Trello API
#

# Query string : token={token}
app.get "/app/auths/request", (req, res) ->
    (new Tokens()).validate req.query['token'], (err, result) =>
        if err
            res.status 401; res.json result
        else unless result
            res.status 401; res.json "Invalid token."
        else
            toa = new TrelloOAuth(result.user_id.toString())
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

# Redirect URL from Trello
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
# Revoke Trello oauth - Remove access_token from user.
# 
app.delete '/app/auths/delete', (req, res)->
    null



#
# Trello API access test APIs
#

#
# Collect all data test execution API
# 
app.get "/app/trello/report/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
    db_users.findByEmail {username: req.params[0]}, (err, user)=>    
        if err
            res.status 404; res.send "No such user"
        else
            console.log(user)
            (new TrelloApi()).collect_data user, (err, result) =>
                if err
                    res.status err
                    res.send result
                else
                    (new TrelloView()).getSummary user, (err, result) =>
                        if err
                            res.status 500
                            res.send "getSummary failed"
                        else
                            res.status 200
                            res.send result  # html

#
# 
# 
app.get "/app/trello/collect/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
    db_users.findByEmail {username: req.params[0]}, (err, user)=>    
        if err
            res.status 404; res.send "No such user"
        else
            console.log(user)
            (new TrelloApi()).collect_data user, (err, result) =>
                if err
                    res.status err
                    res.send result
                else
                    res.status 200
                    res.send result

#
#
# 
app.get "/app/trello/view/(([A-Za-z0-9_\\.\\-@]+))", (req, res) ->
    db_users.findByEmail {username: req.params[0]}, (err, user)=>    
        if err
            res.status 404; res.send "No such user"
        else
            console.log(user)
            (new TrelloView()).getSummary user, (err, result) =>
                if err
                    res.status err
                    res.send result
                else
                    res.status 200
                    res.send result  # HTML

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
#
# Server with Cluster
# 
if (cluster.isMaster) 

    for i in [1..1]   # Specify the number of workers you want to create
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
