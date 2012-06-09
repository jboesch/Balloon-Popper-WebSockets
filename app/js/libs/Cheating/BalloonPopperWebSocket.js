/*
 * Constructor for our WebSocket
 *
 * @param {Object} opts Any options to pass
 */
var BalloonPopperWebSocket = function(opts)
{

    var self = this;

    // Some default options to be filled in
    var default_opts = {
        host: "ws://localhost:8080"
    };

    // Merge in some options
    self.opts = $.extend(true, {}, default_opts, opts);

    // Write your code in the same way as for native WebSocket:
    if(window.WebSocket)
    {
        self.socket = new WebSocket(self.opts.host);
    }
    else
    {
        alert('HA.HA.HA. WebSockets are not supported in your browser. Try Chrome or Firefox.');
        return false;
    }

    self.bindEvents();

    self.Game = null; // Instance of our game.
    self.ready_callback = function(){};

}

BalloonPopperWebSocket.prototype = {

    /*
     * Bind some socket events
     */
    bindEvents: function()
    {

        var self = this;

        self.socket.onopen = function()
        {
            self.onOpen.apply(self, arguments);
        }

        self.socket.onmessage = function(e) {
            self.onMessage.apply(self, arguments);
        };

        self.socket.onclose = function() {
            self.onClose.apply(self, arguments);
        };

    },

    /*
     * Called when our socket opens up
     *
     * @param {Function} cb The callback function
     */
    ready: function(cb)
    {
        var self = this;
        self.ready_callback = cb;
    },

    /*
     * When our socket is open
     */
    onOpen: function()
    {
        var self = this;
        self.ready_callback();
    },

    /*
     * Receive a message from our WebSocket server
     *
     * @param {Object} e The MessageEvent instance
     */
    onMessage: function(e)
    {

        var self = this;

        var data = JSON.parse(e.data);

        // Adding someone to the game
        if(data.adding && !self.Game.playerExists(data.uid))
        {
            self.Game.addPlayerToScoreboard(data);
        }

        // Add points
        if(data.score)
        {
            if(!self.Game.playerExists(data.uid))
            {
                self.Game.addPlayerToScoreboard(data);
            }

            self.Game.setScore(data, data.score);

        }

    },

    /*
     * When we close our socket
     */
    onClose: function()
    {

        var self = this;

        if(self.Game)
        {
            self.Game.end();
        }
        else
        {
            log('Server died!');
        }
    },

    /*
     * Set the game instance
     *
     * @param {Object} Game The instance of our game
     */
    setGame: function(Game)
    {
        var self = this;

        self.Game = Game;
    },

    /*
     * Broadcasting an event.
     * A hook to increment score (called in BalloonPopper.js)
     *
     * @param {Object} player_opts The player options
     * @param {Integer} new_score The new score
     */
    hookIncrementScore: function(player_opts, new_score)
    {
        var self = this;

        player_opts.score = new_score;

        self.socket.send(JSON.stringify(player_opts));

    },


    /*
     * Broadcasting an event.
     * A hook to add a player to the scoreboard (called in BalloonPopper.js)
     *
     * @param {Object} player_opts The player options
     */
    hookAddPlayerToScoreboard: function(player_opts)
    {

        var self = this;

        player_opts.adding = true;

        self.socket.send(JSON.stringify(player_opts));

    }

}