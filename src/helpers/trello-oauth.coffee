#
#  trello_oauth.coffee
#
_     = require 'underscore'
OAuth = require('oauth').OAuth
fs    = require("fs")
http = require('http')
Users = require('../models/users')






module.exports = class TrelloOAuth
    oauth: null     # OAuth object
    oauth_token: null
    oauth_token_secret: null

    requestURL:    "https://trello.com/1/OAuthGetRequestToken"
    accessURL:     "https://trello.com/1/OAuthGetAccessToken"
    authorizeURL:  "https://trello.com/1/OAuthAuthorizeToken"
    appName:       "My Trello OAuth Example"
    key:           "80e7f11a72d431dee0e0db0a52631180"
    secret:        "33c1455220cd7d821bdac09dc8891fc66086359f8936169de2a4d3d56ea2f583"
    user_id: null
    
    #
    # Constructor
    # 
    constructor: (user_id) ->
        @user_id = user_id
        
    #
    # auth.service_id -> service 
    #
    createOAuth: (fn)->
        callback = "http://localhost:3000/app/auths/trello_callback?state=#{@user_id}"
        @oauth = new OAuth(@requestURL, @accessURL, @key, @secret, "1.0", callback, "HMAC-SHA1")
        console.log("createOAuth success")
        fn(null, @oauth)

    #
    # OAuth step 1. Request request-token to get access token.
    # Returns redirect url
    # 
    requestToken: (fn)->
        console.log("requestToken entered")
        # These params are returned values and NOT passing values
        @oauth.getOAuthRequestToken (error, token, tokenSecret, results) =>
            if error
                console.log("requestTOken getOAuthRequestToken error")
                fn(error.statusCode, error.data)
            else
                console.log("requestTOken getOAuthRequestToken good")            
                # These will be written in the auths.settings
                @oauth_token = token
                @oauth_token_secret = tokenSecret
                (new Users()).save_token_secret @user_id, tokenSecret, (err)=>
                    if not err
                        fn(null, "#{@authorizeURL}?oauth_token=#{token}&name=#{@appName}")
                    else
                        console.log('save_token_secret failed')
                    
    #
    # Step 2: Callback for the APP auth page.
    # Please note this isn't called on the same object with the one did the requestToken().
    # 
    callbackCalled: (oauth, query, fn) ->
        console.log(query)
        users = new Users()
        users.get query.state, (err, user)=>
            if err
                console.log("callbackCalled: user could not be found")
                fn(500, "callbackCalled: user could not be found")
                return
            token = query.oauth_token
            tokenSecret = user.token_secret  #oauth_secrets[token]
            verifier = query.oauth_verifier
            oauth.getOAuthAccessToken token, tokenSecret, verifier, (error, access_token, access_token_secret, results) =>
                if error
                    fn(500, 'OAuth.getOAuthAccessToken() failed')
                else
                    values = {access_token: access_token, access_token_secret: access_token_secret}
                    users.save_access_token @user_id, values, (err)=>
                        if err
                            fn(500, 'Users.save_access_token failed')
                        else
                            fn(null, 'all good')