#
# users.coffee
#
#  users collection has only email and password 
#   { "_id" : ObjectId("518b37d647f1af1b31be73f4"), "email" : "test255@gmail.com", "password" : "password" }
#
mongodb = require 'mongodb'
ObjectID = require('mongodb').ObjectID;
dbconnection = require './dbconnection'
should = require('should')


module.exports = class Users extends dbconnection

    #
    # Constructor
    # 
    constructor: ->
        super()

    #
    # Looks up a user data from email (username)
    # 
    findByEmail: (obj, fn) ->
        #console.log obj
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            client.collection 'users', (err, col) =>
                if err
                    console.log(err)
                    client.close()
                    return fn(err, null)
                col.findOne {"email": obj.username}, (err, user) =>
                    client.close()
                    #console.log(user)
                    fn(err, user)

    #
    # Checks if password matches the user.password
    # 
    verifyPassword: (user, password) ->
        r = user.password is password
        console.log(r)
        r

    #
    # Get all users - mongodb.find() example only
    # 
    findAll: (fn) ->
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            client.collection 'users', (err, col) =>
                if err
                    console.log(err)
                    client.close()                    
                    return fn(err, null)
                col.find {}, (err, cursor) =>
                    if err
                        console.log(err)
                        client.close()
                        return fn(err, null)                        
                    cursor.toArray (err, items) =>
                        items.length.should.be.above(0)
                        client.close()
                        fn(err, items)

    #
    # Update user document token_secret
    # 
    save_token_secret: (user_id, value, fn) ->
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            client.collection 'users', (err, col) =>
                if err
                    console.log(err)
                    client.close()                    
                    return fn(err, null)
                col.update { _id: user_id }, { $set: { token_secret: value } }, (err) =>
                    client.close()
                    if err
                        console.log(err)
                        return fn(err, null)
                    else
                        fn(null, "update success")

    #
    # Save access token
    # 
    save_access_token: (user_id, values, fn) ->
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            client.collection 'users', (err, col) =>
                if err
                    console.log(err)
                    client.close()                    
                    return fn(err, null)
                col.update { _id:  new ObjectID user_id }, { $set: values }, (err) =>
                    client.close()
                    if err
                        console.log(err)
                        return fn(err, null)
                    else
                        fn(null, "update success")

    #
    # Get user documemt by _id
    # 
    get: (user_id, fn) ->
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            client.collection 'users', (err, col) =>
                if err
                    client.close()
                    console.log(err)
                    fn(err, null)
                    return
                col.findOne {_id: new ObjectID user_id}, (err, user) =>
                    client.close()
                    console.log("users.get success #{user_id}")
                    console.log(user)
                    fn(null, user)

    #
    # Add a new user
    # 
    add: (params, fn) ->
        # These must exist
        should.exist(params.email)
        should.exist(params.password)
        should.exist(params.trello_username)
        # Check email address
        if not params.email.match(/^[a-zA-Z0-9\\.!#$%&'*+\-/=?\^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
            fn(500, "Invalid email address")
            return
        # Check trello username
        if not params.trello_username.match(/^[a-zA-Z\\.\-0-9_]+$/)
            fn(500, "Invalid Trello username")
            return
        # Values are good
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            p_client.collection 'users', (err, col) =>
                if err
                    p_client.close()
                    fn(500, "Failed to insert a user")
                    return
                values = {
                    email: params.email
                    password: params.password
                    trello_username: params.trello_username
                    created: new Date()
                }
                col.insert values, (err, docs)=>
                    p_client.close()
                    fn(null, "Add user suceess")

    #
    # Remove a user
    # 
    remove: (user_id, fn) ->
        should.exist(user_id)
        client = dbconnection.get_client()
        client.open (err, p_client) =>
            p_client.collection 'users', (err, col) =>
                if err
                    p_client.close()
                    fn(500, "Failed to insert a user")
                    return
                col.remove {_id: new ObjectID user_id}, (err, docs)=>
                    p_client.close()
                    fn(null, "Remove user suceess")        