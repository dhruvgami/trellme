// Generated by CoffeeScript 1.6.3
(function() {
  var ObjectID, TrelloView, Trellos, fs, handlebars, should, _;

  fs = require('fs');

  _ = require('underscore');

  ObjectID = require('mongodb').ObjectID;

  should = require('should');

  handlebars = require('handlebars');

  Trellos = require('../models/trellos');

  module.exports = TrelloView = (function() {
    TrelloView.templates = {
      board: {
        path: 'templates/boards.tmpl',
        template: null
      },
      list: {
        path: 'templates/lists.tmpl',
        template: null
      },
      card: {
        path: 'templates/cards.tmpl',
        template: null
      },
      checklist: {
        path: 'templates/checklists.tmpl',
        template: null
      },
      checkitem: {
        path: 'templates/checkitems.tmpl',
        template: null
      }
    };

    TrelloView.template_compiled = false;

    function TrelloView() {
      var keys,
        _this = this;
      if (TrelloView.template_compiled !== true) {
        keys = _.keys(TrelloView.templates);
        _.each(keys, function(key) {
          var tmpl;
          tmpl = fs.readFileSync(__dirname + '/' + TrelloView.templates[key].path);
          return TrelloView.templates[key].template = handlebars.compile(tmpl.toString());
        });
        TrelloView.template_compiled = true;
      }
    }

    TrelloView.prototype.renderHtml = function(trellos, user_id, fn) {
      var htmls,
        _this = this;
      htmls = [];
      return trellos.get_boards(user_id, function(err, myboards) {
        return trellos.get_all_lists(user_id, function(err, mylists) {
          return trellos.get_all_cards(user_id, function(err, mycards) {
            return trellos.get_all_checklists(user_id, function(err, mychecklists) {
              var ret;
              htmls = [];
              _.each(myboards.boards, function(board) {
                var list, listhtmls;
                list = _.find(mylists, function(list) {
                  return list.board_id === board.id;
                });
                listhtmls = [];
                _.each(list.lists, function(ll) {
                  var cardhtmls, cards1, listhtml;
                  cards1 = _.find(mycards, function(cards) {
                    return cards.list_id === ll.id;
                  });
                  if (cards1) {
                    cardhtmls = [];
                    _.each(cards1.cards, function(cc) {
                      var cardhtml, clhtmls, cls;
                      cls = _.filter(mychecklists, function(cl) {
                        return cl.card_id === cc.id;
                      });
                      clhtmls = [];
                      _.each(cls, function(cl) {
                        var cihtml, cihtmls, clhtml,
                          _this = this;
                        cihtmls = [];
                        _.each(cl.checklists.checkItems, function(ci) {
                          var cihtml;
                          cihtml = TrelloView.templates.checkitem.template(ci);
                          return cihtmls.push(cihtml);
                        });
                        cihtml = cihtmls.join("\n");
                        cl.checklists.checkItems = cihtml;
                        clhtml = TrelloView.templates.checklist.template(cl.checklists);
                        return clhtmls.push(clhtml);
                      });
                      cc.checklists = clhtmls.join("\n");
                      cardhtml = TrelloView.templates.card.template(cc);
                      return cardhtmls.push(cardhtml);
                    });
                    ll.cards = cardhtmls.join("\n");
                  }
                  listhtml = TrelloView.templates.list.template(ll);
                  return listhtmls.push(listhtml);
                });
                board.lists = listhtmls.join("\n");
                return htmls.push(TrelloView.templates.board.template(board));
              });
              ret = htmls.join("\n");
              return fn(null, ret);
            });
          });
        });
      });
    };

    TrelloView.prototype.getSummary = function(user, fn) {
      var trellos;
      trellos = new Trellos();
      return this.renderHtml(trellos, new ObjectID(user._id.toString()), fn);
    };

    return TrelloView;

  })();

}).call(this);