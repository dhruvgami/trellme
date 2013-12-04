// Generated by CoffeeScript 1.6.3
(function() {
  var LocalStrategy, MailService, Tokens, TrelloApi, TrelloOAuth, TrelloView, Trellos, Users, app, authRequired, cluster, config, db_users, express, http, i, notificationLoop, passport, server, _, _i;

  cluster = require('cluster');

  express = require("express");

  http = require("http");

  passport = require("passport");

  LocalStrategy = require("passport-local").Strategy;

  _ = require("underscore");

  Users = require("./models/users");

  Tokens = require("./models/tokens");

  Trellos = require('./models/trellos');

  TrelloOAuth = require("./helpers/trello-oauth");

  TrelloApi = require("./helpers/trello-api");

  MailService = require("./helpers/mailservice");

  TrelloView = require("./views/trello-view");

  config = require(__dirname + '/../config/config.json');

  db_users = new Users();

  passport.use('api', new LocalStrategy({
    usernameField: 'email'
  }, function(email, password, done) {
    return process.nextTick(function() {
      return Users.findByEmail(email, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: "Unknown user with email " + email
          });
        }
        if (!user.verifyPassword(password)) {
          return done(null, false, {
            message: "Invalid password"
          });
        }
        return done(null, user);
      });
    });
  }));

  passport.serializeUser(Users.serialize);

  passport.deserializeUser(Users.deserialize);

  authRequired = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401);
    return res.send('Unauthorized');
  };

  app = express();

  app.configure(function() {
    app.set("port", process.env.PORT || 3000);
    app.use(express.logger("dev"));
    app.use(express.favicon());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({
      secret: 'change-me-before-going-to-production'
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    return app.use(express["static"](__dirname + "/../../client"));
  });

  app.configure("development", function() {
    return app.use(express.errorHandler());
  });

  app.post('/login', passport.authenticate('api'), function(req, res) {
    var tokens;
    tokens = new Tokens();
    return tokens.create(req.user, function(err, tk) {
      return res.json(tk[0]);
    });
  });

  app["delete"]('/logout', function(req, res) {
    req.logout();
    res.status(204);
    return res.send('');
  });

  app.get('/me', authRequired, function(req, res) {
    return res.json(req.user);
  });

  app.get('/settings', authRequired, function(req, res) {
    return req.user.getSettings(function(err, settings) {
      if (err) {
        res.status(500);
        return res.send(err);
      } else {
        res.status(200);
        return res.json(settings);
      }
    });
  });

  app.post('/settings', authRequired, function(req, res) {
    return req.user.saveSettings(req.body, function(err, user) {
      if (err) {
        res.status(500);
        return res.send(err);
      } else {
        res.status(201);
        return res.json(user.settings);
      }
    });
  });

  app.post("/app/users", function(req, res) {
    return Users.create(req.body, function(err, user) {
      if (err) {
        res.status(err);
        return res.send(result);
      } else {
        res.status(201);
        return res.json(user);
      }
    });
  });

  app.get("/app/auths/request/(([A-Za-z0-9_\\.\\-@]+))", function(req, res) {
    var _this = this;
    return Users.findByEmail(req.params[0], function(err, user) {
      var toa;
      if (err) {
        res.status(401);
        return res.send("No such user");
      } else {
        toa = new TrelloOAuth(user._id.toString());
        return toa.createOAuth(function(err, oauth) {
          if (err) {
            res.status(err);
            return res.send(oauth);
          } else {
            return toa.requestToken(function(err, redirectUrl) {
              if (!err) {
                res.status(302);
                return res.redirect(redirectUrl);
              } else {
                res.status(500);
                return res.json(redirectUrl);
              }
            });
          }
        });
      }
    });
  });

  app.get("/app/auths/trello_callback", function(req, res) {
    var toa,
      _this = this;
    if (typeof req.query.oauth_verifier !== 'undefined') {
      toa = new TrelloOAuth(req.query.state);
      return toa.createOAuth(function(err, oauth) {
        return toa.callbackCalled(oauth, req.query, function(err, resp) {
          if (err) {
            res.status(500);
            return res.send('<script>window.close();</script>');
          } else {
            res.status(200);
            return res.send('<script>window.close();</script>');
          }
        });
      });
    } else if (typeof req.query.denied !== 'undefined') {
      res.status(200);
      return res.send('<script>window.close();</script>');
    } else {
      res.status(404);
      return res.send('<script>window.close();</script>');
    }
  });

  app.get("/app/auths/status/(([A-Za-z0-9_\\.\\-@]+))", function(req, res) {
    var _this = this;
    return Users.findByEmail({
      username: req.params[0]
    }, function(err, user) {
      var stat;
      if (err) {
        res.status(401);
        return res.send("No such user");
      } else {
        if (_.isUndefined(users.access_token)) {
          stat = "no";
        } else {
          stat = "yes";
        }
        res.status(200);
        return res.send(stat);
      }
    });
  });

  app.get("/app/trello/collect", authRequired, function(req, res) {
    var _this = this;
    return new TrelloApi().collect_data_sync(req.user, function(err, result) {
      if (err) {
        res.status(500);
        return res.send(err);
      } else {
        res.status(200);
        return res.json(result);
      }
    });
  });

  app.get("/app/trello/view", authRequired, function(req, res) {
    return new TrelloView().getSummary(req.user, function(err, result) {
      if (err) {
        res.status(500);
        return res.send(err);
      } else {
        return res.send(result);
      }
    });
  });

  app.get("/app/trello/reports", authRequired, function(req, res) {
    return new TrelloView().getReports(req.user._id, function(err, result) {
      if (err) {
        res.status(500);
        return res.send(err);
      } else {
        return res.json(result);
      }
    });
  });

  app.get("/app/trello/((\\w+))/(([A-Za-z0-9_\\.\\-@]+))", function(req, res) {
    var _this = this;
    return Users.findByEmail({
      username: req.params[1]
    }, function(err, user) {
      if (err) {
        res.status(404);
        return res.send("No such user");
      } else {
        return (new TrelloApi()).request(req.params[0], user, {}, function(err, result) {
          if (err) {
            res.status(500);
            return res.send(err);
          } else {
            return res.json(result);
          }
        });
      }
    });
  });

  app.get("/app/update", function(req, res) {
    var mailservice,
      _this = this;
    mailservice = new MailService();
    console.log('Update starting...');
    Users.findAll(function(err, users) {
      if (err) {
        res.status(err);
        return res.send("Error updating reports");
      } else {
        mailservice.send_report(users);
        return res.status(200);
      }
    });
    console.log('Update complete');
    return res.send("OK");
  });

  notificationLoop = function() {
    var mailservice, nloop, trelloView, trellos,
      _this = this;
    mailservice = new MailService();
    trellos = new Trellos();
    trelloView = new TrelloView();
    return nloop = setInterval(function() {
      return Users.subscribedUsers(function(err, users) {
        return _.each(users, function(user) {
          return trellos.get_all_data(user._id, function(err, all) {
            var mailtext, result;
            result = trelloView.all_card_due_notifications(all, user);
            if (result !== '') {
              mailtext = MailService.template({
                content: result
              });
              mailservice.send(mailtext, user.email, config.mail.due_notify_subject);
              return console.log("Due notification sent to " + user.email);
            }
          });
        });
      });
    }, 1000 * 10 * 60);
  };

  if (cluster.isMaster) {
    for (i = _i = 1; _i <= 2; i = ++_i) {
      cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
      var exitCode;
      exitCode = worker.process.exitCode;
      console.log("worker " + worker.process.id + " died (" + exitCode + "). Restarting...");
      return cluster.fork();
    });
    cluster.on('online', function(worker) {
      return console.log("worker(" + worker.id + ") with PID " + worker.process.pid + " online.");
    });
    cluster.on('listening', function(worker, address) {
      return console.log("worker(" + worker.id + ").listening " + address.address + ":" + address.port);
    });
    server = http.createServer(app);
    server.listen(app.get('port'));
  } else if (cluster.isWorker) {
    console.log("worker(" + cluster.worker.id + ")");
    if (cluster.worker.id === 2) {
      notificationLoop();
    }
  }

}).call(this);
