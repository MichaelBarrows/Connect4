"use strict";



define('cw2/app', ['exports', 'cw2/resolver', 'ember-load-initializers', 'cw2/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
define('cw2/components/connect-4', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  // the four patterns that need to be matched to win the game
  var winning_patterns = [
  // down
  [['p', 0, 1], ['p', 0, 1], ['p', 0, 1], ['p']],
  // across
  [['p', 1, 0], ['p', 1, 0], ['p', 1, 0], ['p']],
  // diagonally (from left hand side)
  [['p', 1, 1], ['p', 1, 1], ['p', 1, 1], ['p']],
  // diagonally (from right hand side)
  [['p', 1, -1], ['p', 1, -1], ['p', 1, -1], ['p']]];

  // the patterns and scores the computer player uses to determine its next move
  var patterns = [
  // four markers next to each other (winning patterns)
  {
    pattern: [['p', 0, 1], ['p', 0, 1], ['p', 0, 1], ['p']],
    score: 1000
  }, {
    pattern: [['p', 1, 0], ['p', 1, 0], ['p', 1, 0], ['p']],
    score: 1000
  }, {
    pattern: [['p', 1, 1], ['p', 1, 1], ['p', 1, 1], ['p']],
    score: 1000
  }, {
    pattern: [['p', 1, -1], ['p', 1, -1], ['p', 1, -1], ['p']],
    score: 1000
  },
  // three markers next to each other
  {
    pattern: [['p', 0, 1], [['p', 0, 1]], ['p']],
    score: 500
  }, {
    pattern: [['p', 1, 0], [['p', 1, 0]], ['p']],
    score: 500
  }, {
    pattern: [['p', 1, 1], [['p', 1, 1]], ['p']],
    score: 500
  }, {
    pattern: [['p', 1, -1], [['p', 1, -1]], ['p']],
    score: 500
  },
  // two markers next to each other
  {
    pattern: [['p', 0, 1], ['p']],
    score: 100
  }, {
    pattern: [['p', 1, 0], ['p']],
    score: 100
  }, {
    pattern: [['p', 1, 1], ['p']],
    score: 100
  }, {
    pattern: [['p', 1, -1], ['p']],
    score: 100
  }];

  /**
  * This function checks to see if a player has won the game by comparing the
  * state of the playing board against the winning patterns.
  * it loops over all of the patterns and sends the game state, pattern to be
  * checked and the player to the match_pattern() function which determines if
  * they match, if they match, the winner is returned, if there is no winner and
  * no more moves can be made, a blank string is returned to indicate a draw
  */
  function check_game_winner(state) {
    var winner;
    var patterns = winning_patterns;
    // loop over each of the winning patterns
    for (var pidx = 0; pidx < patterns.length; pidx++) {
      var pattern = patterns[pidx];
      // check if the red player has won thegame by completing the pattern
      if (match_pattern(state, pattern, 'red')) {
        // set the winner to red
        winner = 'red';
        // check if the yellow player has won the game by completing the pattern
      } else if (match_pattern(state, pattern, 'yellow')) {
        // set the winner to yellow
        winner = 'yellow';
      }
      // checks if a winner has been identified and sends returns the player
      if (winner) {
        return winner;
      }
    }

    /**
    * if a player hasn't won the game and there are no more positions that can
    * be played the game must have ended in a draw
    */
    var draw = true;
    for (var x = 0; x <= 7; x++) {
      for (var y = 0; y <= 6; y++) {
        if (!state[x][y]) {
          return undefined;
        }
      }
    }
    return '';
  }

  /**
  * The computer_move function is called when it is the computers turn to play
  * a move, the function takes the state as a parameter and uses the alphabeta()
  * (minimax) function to determine the best move to make.
  */
  function computer_move(state) {
    // sends the state to the alphabeta() function to look 4 moves ahead and
    // determine the best move to make
    var moves = alphabeta(state, 4, 'red', Number.MIN_VALUE, Number.MAX_VALUE);
    var max_score = undefined;
    var move = undefined;
    // loops over all of the moves, identifying the move with the highest score,
    // which would be the best to play
    for (var idx = 0; idx < moves.length; idx++) {
      if (max_score === undefined || moves[idx].score > max_score) {
        max_score = moves[idx].score;
        move = {
          x: moves[idx].x,
          y: moves[idx].y
        };
      }
    }
    return move;
  }
  /**
  * clones the state of the game for the minimax algorithm to determine how
  * playing various positions will play out, returning the resulting state
  * from playing the move
  */
  function deepClone(state) {
    var new_state = [];
    for (var sidx = 0; sidx < state.length; sidx++) {
      new_state.push(state[sidx].slice(0));
    }
    return new_state;
  }

  /**
  * match_pattern() function is used to determine if a play has matched a pattern,
  * by looping over every position played and sending the pattern, state, player
  * and x & y positions to the match_pattern_at() function, which determines
  * whether a match has occured
  */
  function match_pattern(state, pattern, player) {
    for (var mpidx1 = 0; mpidx1 < state.length; mpidx1++) {
      for (var mpidx2 = 0; mpidx2 < state[mpidx1].length; mpidx2++) {
        var matches = match_pattern_at(state, pattern, player, mpidx1, mpidx2);
        if (matches) {
          return true;
        }
      }
    }
    return false;
  }

  /**
  * the heuristic() function calculates a 'score' of playing a move, to determine
  * the best move to play for the computer and the worst move the user could play
  */
  function heuristic(state) {
    var score = 0;
    // loops over the patterns to calculate a score for the particular play for
    // the computer
    for (var hidx = 0; hidx < patterns.length; hidx++) {
      if (match_pattern(state, patterns[hidx].pattern, 'red')) {
        score = score + patterns[hidx].score;
      }
      // checks if the play would allow the user to win
      if (match_pattern(state, patterns[hidx].pattern, 'yellow')) {
        score = score - patterns[hidx].score;
      }
    }
    return score;
  }

  /**
  * the alphabeta() function implements and optimises the minimax algorithm for
  * finding positions, the alphabeta aspect stops the minimax algorithm for
  * searching for plays that would not be of benefit to the computer player.
  * this function also clones the state to simulate how playing various positions
  * would play out for the computer player
  */
  function alphabeta(state, limit, player, alpha, beta) {
    var moves = [];
    if (limit > 0) {
      var cutoff;
      if (player === 'red') {
        cutoff = Number.MIN_VALUE;
      } else {
        cutoff = Number.MAX_VALUE;
      }
      for (var mmidx1 = 0; mmidx1 < 7; mmidx1++) {
        for (var mmidx2 = 0; mmidx2 < 6; mmidx2++) {
          if (state[mmidx1][mmidx2] == undefined) {
            var move = {
              x: mmidx1,
              y: mmidx2,
              state: deepClone(state),
              score: 0
            };
            move.state[mmidx1][mmidx2] = player;
            // restricts the minimax algorithm if the algorithm is only looking
            // one move ahead
            if (limit === 1 || check_game_winner(move.state) !== undefined) {
              move.score = heuristic(move.state);
            } else {
              move.moves = alphabeta(move.state, limit - 1, player == 'yellow' ? 'red' : 'yellow', alpha, beta);
              var score = undefined;
              for (var mmidx3 = 0; mmidx3 < move.moves.length; mmidx3++) {
                if (score === undefined) {
                  score = move.moves[mmidx3].score;
                } else if (player === 'yellow') {
                  score = Math.max(score, move.moves[mmidx3].score);
                } else if (player === 'red') {
                  score = Math.min(score, move.moves[mmidx3].score);
                }
              }
              move.score = score;
            }
            // adds the move to the moves list
            moves.push(move);
            // calculates the alpha and beta values to restrict the searching
            if (player === 'red') {
              cutoff = Math.max(cutoff, move.score);
              alpha = Math.max(cutoff, alpha);
            } else {
              cutoff = Math.min(cutoff, move.score);
              beta = Math.min(cutoff, beta);
            }
            // there are no better or worse moves at this point
            if (beta <= alpha) {
              return moves;
            }
          }
        }
      }
    }
    return moves;
  }

  /**
  * match_pattern_at() function recursively checks if a single pattern is
  * matched in the games state to determine a good position to play for the
  * computer and the winner of the game
  */
  function match_pattern_at(state, pattern, player, x, y) {
    if (x >= 0 && x < state.length) {
      if (y >= 0 && y < state[x].length) {
        var element = pattern[0];
        if (element[0] == 'p') {
          if (state[x][y] !== player) {
            return false;
          }
        } else if (element[0] == '') {
          if (state[x][y] !== undefined) {
            return false;
          }
        }
        // recursively calls itself again if there are more patterns to be checked
        if (pattern.length > 1) {
          return match_pattern_at(state, pattern.slice(1), player, x + element[1], y + element[2]);
        } else {
          return true;
        }
      }
    }
    return false;
  }

  exports.default = Ember.Component.extend({
    // variables to hold the applications state
    playing: false,
    winner: undefined,
    draw: false,
    yellow: undefined,
    red: undefined,
    init: function init() {
      // allows the didInsertElement function to run
      this._super.apply(this, arguments);
      // registers the sounds for use later
      createjs.Sound.registerSound("assets/sounds/click.wav", "place-marker");
      createjs.Sound.registerSound("assets/sounds/falling.mp3", "falling");
      createjs.Sound.registerSound("assets/sounds/tada.wav", "tada");
    },
    // Called after ember inserts the canvas into the browsers DOM
    didInsertElement: function didInsertElement() {
      // Select the canvas element
      var stage = new createjs.Stage(this.$('#stage')[0]);
      // Draw the board game
      var board = new createjs.Shape();
      var graphics = board.graphics;
      // Set the colour for the playing board
      graphics.beginFill('#36938F');
      // horizontal lines
      graphics.drawRect(0, 0, 294, 2);
      graphics.drawRect(0, 42, 294, 2);
      graphics.drawRect(0, 84, 294, 2);
      graphics.drawRect(0, 126, 294, 2);
      graphics.drawRect(0, 168, 294, 2);
      graphics.drawRect(0, 210, 294, 2);
      graphics.drawRect(0, 252, 296, 2);
      // vertical lines
      graphics.drawRect(0, 0, 2, 252);
      graphics.drawRect(42, 0, 2, 252);
      graphics.drawRect(84, 0, 2, 252);
      graphics.drawRect(126, 0, 2, 252);
      graphics.drawRect(168, 0, 2, 252);
      graphics.drawRect(210, 0, 2, 252);
      graphics.drawRect(252, 0, 2, 252);
      graphics.drawRect(294, 0, 2, 252);
      // Measurements to indent the playing board by
      board.x = 42;
      board.y = 40;
      // hide the board ready for animation
      board.alpha = 0;
      this.set('board', board);
      // add the board to the canvas
      stage.addChild(board);
      // object to store the playing markers
      var markers = {
        'red': [],
        'yellow': []
        // for loop to create 21 markers of each colour
      };for (var x = 0; x < 21; x++) {
        // Create the red markers
        var redMarker = new createjs.Shape();
        graphics = redMarker.graphics;
        graphics.beginFill('#FF0000');
        graphics.drawCircle(0, 0, 15);
        // Hide the red marker
        redMarker.visible = false;
        // add the red marker to the canvas
        stage.addChild(redMarker);
        // add the red marker to the object storing the markers
        markers.red.push(redMarker);

        // Create the yellow markers
        var yellowMarker = new createjs.Shape();
        graphics = yellowMarker.graphics;
        graphics.beginFill('#FFFF00');
        graphics.drawCircle(0, 0, 15);
        // Hide the yellow markers
        yellowMarker.visible = false;
        // Add the yellow marker to the canvas
        stage.addChild(yellowMarker);
        // Add the yellow marker to the object storing the markers
        markers.yellow.push(yellowMarker);
      }
      // sets the variables to hold the game state
      this.set('markers', markers);
      this.set('stage', stage);
      // event listener for animation changes
      createjs.Ticker.addEventListener("tick", stage);
    },
    // Handles the users clicks to place the users marker and then allows the
    // computer to play their move
    click: function click(ev) {
      var component = this;
      // checks the user is playing the game and there is no winner yet
      if (component.get('playing') && !component.get('winner')) {
        // checks that the click was within the playing board
        if (ev.target.tagName.toLowerCase() == 'canvas' && ev.offsetX >= 40 && ev.offsetY >= 40 && ev.offsetX < 336 && ev.offsetY < 294) {
          // calculates which column of the board the click occured in
          var x = Math.floor((ev.offsetX - 40) / 42);
          // sets the row to the bottommost row
          var y = 5;
          // gets the state of the game
          var state = component.get('state');
          // checks if the bottommost square of the column is filled, and works up until an empty square is identified
          while (state[x][y] == 'red' || state[x][y] == 'yellow') {
            // ensures the marker cannot be placed above the board
            if (y > 0) {
              // moves up a row
              y -= 1;
            } else {
              // an empty position has been identified
              break;
            }
          }
          // checks the position is empty
          if (!state[x][y]) {
            createjs.Sound.play("place-marker");
            // var player = component.get('player');
            state[x][y] = 'yellow';
            // gets the number of moves for the yellow player
            var move_count = component.get('moves')['yellow'];
            var marker = component.get('markers')['yellow'][move_count];

            marker.visible = true;
            // determines the column the marker is being placed in
            marker.x = 64 + x * 42;
            // animates the marker to make it appear to dropdown
            createjs.Tween.get(marker).to({ y: 62 + y * 42 }, 400);
          }
          // red players turn
          component.set('red', true);
          component.set('yellow', undefined);
          // calls the check_winner() function to see if someone has won the game
          component.check_winner();
          // increments the move counter for the yellow player
          component.get('moves')['yellow'] = move_count + 1;
          // delays the computers move by 500ms to make it appear to think about
          // the next move
          setTimeout(function () {
            // checks that the game is still playable
            if (!component.get('winner') && !component.get('draw')) {
              var move = computer_move(state);
              // sets the row to the bottommost row
              move.y = 5;
              // checks if the bottommost square of the column is filled, and works up until an empty square is identified
              while (state[move.x][move.y] == 'red' || state[move.x][move.y] == 'yellow') {
                // checks the top of the column hasn't been reached
                if (move.y > 0) {
                  // moves up a row for the next iteration of the while loop
                  move.y -= 1;
                } else {
                  // an empty position has been found
                  break;
                }
              }
              // gets the number of moves the computer has made
              move_count = component.get('moves')['red'];
              // sets the state of the position played to the computers colour
              state[move.x][move.y] = 'red';
              marker = component.get('markers')['red'][move_count];
              // animates the marker to make it appear
              createjs.Tween.get(marker).wait(500).to({ alpha: 1 }, 1000);
              marker.visible = true;
              // sets the column for the marker to go into
              marker.x = 64 + move.x * 42;
              // animates the marker to dropdown
              createjs.Tween.get(marker).to({ y: 62 + move.y * 42 }, 400);
              // increments the move count
              component.get('moves')['red'] = move_count + 1;
              // yellow players turn
              component.set('red', undefined);
              component.set('yellow', true);
              // checks if the position played resulted in the computer winning
              // the game
              component.check_winner();
            }
          }, 500);
        }
      }
    },
    // calls the check_game_winner() function which then checks the players moves
    // to see if they've won the game
    check_winner: function check_winner() {
      var state = this.get('state');
      var winner = check_game_winner(state);
      // checks if the winner variable has been set
      if (winner !== undefined) {
        // evaluates whether the winner variable is identifing a draw
        if (winner === '') {
          // disables the player turn messages
          this.set('yellow', undefined);
          this.set('red', undefined);
          this.set('draw', true);
        } else {
          // the player has won the game
          // disables the player turn messages
          this.set('yellow', undefined);
          this.set('red', undefined);
          // plays a sound to signify a player has won
          createjs.Sound.play("tada");
          // the winner is sent to the UI
          this.set('winner', winner);
        }
      }
    },
    actions: {
      /**
      * shows the board when the start button is pressed and animates the
      * invisible markers to the top of the board ready for the user to play.
      * also defines the variables to control the game, and the state of gameplay
      */
      start: function start() {
        var board = this.get('board');
        board.alpha = 0;
        if (this.get('playing')) {
          var markers = this.get('markers');
          // loops over the markers moving them back to the top of the board,
          // without showing them
          for (var idx = 0; idx < 21; idx++) {
            createjs.Tween.get(markers.red[idx]).to({ y: 0 }, 0);
            createjs.Tween.get(markers.yellow[idx]).to({ y: 0 }, 0);
          }
          createjs.Sound.play("falling");
          createjs.Tween.get(board).wait(500).to({ alpha: 1 }, 1000);
        } else {
          createjs.Tween.get(board).to({ alpha: 1 }, 1000);
        }
        this.set('playing', true);
        this.set('winner', undefined);
        this.set('draw', undefined);
        // sets the game board to be empty
        this.set('state', [[undefined, undefined, undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined, undefined, undefined]]);
        // sets the move counts to zero
        this.set('moves', { 'red': 0, 'yellow': 0 });
        // lets the user play first
        this.set('player', 'yellow');
        // enables the yellow player message in the UI
        this.set('yellow', true);
        markers = this.get('markers');
        // makes the markers invisible, so they cannot be seen before playing the
        // game
        for (var midx = 0; midx < 21; midx++) {
          markers.yellow[midx].visible = false;
          markers.red[midx].visible = false;
        }
        // updates the stage when graphics are changed
        this.get('stage').update();
      }
    }
  });
});
define('cw2/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
define('cw2/helpers/app-version', ['exports', 'cw2/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  var version = _environment.default.APP.version;
  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (hash.hideSha) {
      return version.match(_regexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_regexp.shaRegExp)[0];
    }

    return version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
define('cw2/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('cw2/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define('cw2/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'cw2/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var name = void 0,
      version = void 0;
  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
define('cw2/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('cw2/initializers/data-adapter', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('cw2/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('cw2/initializers/export-application-global', ['exports', 'cw2/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('cw2/initializers/injectStore', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('cw2/initializers/store', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('cw2/initializers/transforms', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("cw2/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('cw2/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('cw2/router', ['exports', 'cw2/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {
    this.route('game', { path: '/' });
  });

  exports.default = Router;
});
define('cw2/routes/game', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
define('cw2/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
define("cw2/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "/Ut0YkyM", "block": "{\"symbols\":[],\"statements\":[[6,\"section\"],[9,\"id\",\"app\"],[7],[0,\"\\n\"],[0,\"  \"],[6,\"header\"],[7],[0,\"\\n\"],[0,\"    \"],[6,\"h1\"],[7],[4,\"link-to\",[\"game\"],null,{\"statements\":[[0,\"Connect 4\"]],\"parameters\":[]},null],[8],[0,\"\\n  \"],[8],[0,\"\\n  \"],[6,\"article\"],[7],[0,\"\\n\"],[0,\"    \"],[1,[18,\"outlet\"],false],[0,\"\\n  \"],[8],[0,\"\\n\"],[0,\"  \"],[6,\"footer\"],[7],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"float-left\"],[7],[0,\"\\n      \"],[6,\"p\"],[7],[0,\"Powered by Ember.\"],[8],[0,\"\\n    \"],[8],[0,\"\\n    \"],[6,\"div\"],[9,\"class\",\"float-right\"],[7],[0,\"\\n      \"],[6,\"p\"],[7],[0,\"Built by Michael Barrows\"],[8],[0,\"\\n    \"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "cw2/templates/application.hbs" } });
});
define("cw2/templates/components/connect-4", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "oODRi7gz", "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[20,[\"playing\"]]],null,{\"statements\":[[6,\"div\"],[9,\"class\",\"button-container\"],[7],[0,\"\\n  \"],[6,\"button\"],[3,\"action\",[[19,0,[]],\"start\"]],[7],[0,\"Restart\"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[6,\"div\"],[9,\"class\",\"button-container\"],[7],[0,\"\\n  \"],[6,\"button\"],[3,\"action\",[[19,0,[]],\"start\"]],[7],[0,\"Start\"],[8],[0,\"\\n\"],[8],[0,\"\\n\"]],\"parameters\":[]}],[0,\"\\n\"],[6,\"canvas\"],[9,\"id\",\"stage\"],[9,\"width\",\"380\"],[9,\"height\",\"340\"],[7],[8],[0,\"\\n\"],[4,\"if\",[[20,[\"playing\"]]],null,{\"statements\":[[4,\"if\",[[20,[\"winner\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"message game-over\"],[7],[0,\"\\n    \"],[6,\"p\"],[7],[1,[18,\"winner\"],false],[0,\" wins!\"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[20,[\"draw\"]]],null,{\"statements\":[[0,\"  \"],[6,\"div\"],[9,\"class\",\"message game-over\"],[7],[0,\"\\n    \"],[6,\"p\"],[7],[0,\"We'll call it a draw\"],[8],[0,\"\\n  \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[20,[\"yellow\"]]],null,{\"statements\":[[0,\"    \"],[6,\"div\"],[9,\"class\",\"message yellow\"],[7],[0,\"\\n      \"],[6,\"p\"],[7],[0,\"Your Turn\"],[8],[0,\"\\n    \"],[8],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[20,[\"red\"]]],null,{\"statements\":[[0,\"    \"],[6,\"div\"],[9,\"class\",\"message red\"],[7],[0,\"\\n      \"],[6,\"p\"],[7],[0,\"Computer's Turn\"],[8],[0,\"\\n    \"],[8],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[]},null]],\"hasEval\":false}", "meta": { "moduleName": "cw2/templates/components/connect-4.hbs" } });
});
define("cw2/templates/game", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "mudTM4aP", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"connect-4\"],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "cw2/templates/game.hbs" } });
});


define('cw2/config/environment', [], function() {
  var prefix = 'cw2';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

if (!runningTests) {
  require("cw2/app")["default"].create({"name":"cw2","version":"0.0.0"});
}
//# sourceMappingURL=cw2.map
