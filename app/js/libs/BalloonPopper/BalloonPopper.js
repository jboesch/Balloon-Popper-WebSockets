/*
 * Constructor for our game
 *
 * @param {Object} opts Any game options to pass
 */
var BalloonPopper = function(opts)
{

    var self = this;

    // Some default options to be filled in
    var default_opts = {
        hook: null, // hook for callbacks
        balloon: null,
        templates: {
            player: '<li id="li-{{id}}" class="{{you}}"><span class="score" style="background:{{color}}">{{score}}</span><span id="{{id}}" class="player">{{name}}</span></li>'
        },
        max_score: 5,
        elements: {
            stage: null,
            score_board: null
        },
        callbacks: {
            end: function(){}
        }
    };

    // Each player gets some options. Name, unique id, color etc.
    self.player_opts = {};

    // Our unique id of when we started our balloon interval
    self.balloon_interval = null;

    // Game options
    self.opts = $.extend(true, {}, default_opts, opts);

}

/*
 * Static stuff
 */
BalloonPopper.colors = [
    'green',
    'yellow',
    'blue',
    'orange',
    'purple',
    'brown',
    'black',
    'pink',
    'salmon',
    'dodgerblue',
    'gold',
    'greenyellow',
    'lightblue',
    'lavender',
    'maroon',
    'powderblue',
    'seagreen'
];

BalloonPopper.prototype = {

    /*
     * Start it up! Only pass the player name for now.
     *
     * @param {Object} player_opts Player options (name)
     */
    start: function(player_opts)
    {

        var self = this;

        var default_opts = {
            explosion_color: '',
            name: '',
            uid: Utils.generateUniqueID()
        };

        self.player_opts = $.extend(true, {}, default_opts, player_opts);

        // Everyone gets their own unique color
        if(!self.player_opts.explosion_color)
        {
            var random_color_key = Math.floor(Math.random() * BalloonPopper.colors.length);
            self.player_opts.explosion_color = BalloonPopper.colors[random_color_key];
        }

        // Height 100%!, position: relative;
        self.setStageStyles();

        self.setScoreboardStyles();

        // Any resizing? Clicking?
        self.bindEvents();

        // Draw our balloons
        self.balloon_interval = setInterval(function(){
            self.drawBalloon();
        }, 1000);

        self.addPlayerToScoreboard(self.player_opts, true);

    },

    /*
     * When the game is over or the server has been disconnected
     */
    end: function(player_opts)
    {

        var self = this;

        clearInterval(self.balloon_interval);
        self.opts.callbacks.end(player_opts);

    },

    /*
     * Add a player to the scoreboard
     *
     * @param {Object} player_opts Player options (name, score, uid etc)
     * @param {Bool} is_you Is this you that we're adding to the scoreboard?
     */
    callbackHook: function(hook)
    {
        var self = this;

        var hook_uc = hook.charAt(0).toUpperCase();
        var hook_func = 'hook' + hook_uc + hook.substr(1);

        if(self.opts.hook && self.opts.hook[hook_func])
        {
            var args = Array.prototype.slice.call(arguments, 1);
            self.opts.hook[hook_func].apply(self.opts.hook, args);
        }

    },

    /*
     * Bind any events. Resizing, delegating etc.
     */
    bindEvents: function()
    {

        var self = this;

        // We need to adjust some stage styles if we resize our window
        $(window).bind('resize', function(){
            self.setStageStyles();
        });

        // When you click on the stage, detect if it was a balloon that we clicked?
        self.opts.elements.stage.delegate('.balloon', 'click', function(e){
            var balloon = $(this).data('BalloonInstance');
            balloon.destroy({
                explode: true
            });
            self.incrementScore(self.player_opts);
        });

    },

    /*
     * Check if a player exists
     *
     * @param {String} uid The unique id of the player
     */
    playerExists: function(uid)
    {

        return $('#' + uid).length;

    },

    /*
     * Add a player to the scoreboard
     *
     * @param {Object} player_opts Player options (name, score, uid etc)
     * @param {Bool} is_you Is this you that we're adding to the scoreboard?
     */
    addPlayerToScoreboard: function(player_opts, is_you)
    {

        var self = this;

        var player_template = Handlebars.compile(self.opts.templates.player);

        var tpl = player_template({
            name: player_opts.name,
            score: 0,
            id: player_opts.uid,
            color: player_opts.explosion_color,
            you: (is_you ? 'you' : '')
        });

        self.opts.elements.score_board.append(tpl);

        self.callbackHook('addPlayerToScoreboard', player_opts);

    },

    /*
     * Increment a score
     *
     * @param {Object} player_opts The player options
     */
    incrementScore: function(player_opts)
    {

        var self = this;

        var score_el = self.opts.elements.score_board.find('#li-' + player_opts.uid + ' .score');
        var new_score = parseInt(score_el.text()) + 1;

        score_el.text(new_score);
        self.callbackHook('incrementScore', player_opts, new_score);

    },

    /*
     * Set a score
     *
     * @param {Object} player_opts The player options
     * @param {Integer} score The score we're setting it to for that player
     */
    setScore: function(player_opts, score)
    {

        var self = this;

        var score_el = self.opts.elements.score_board.find('#li-' + player_opts.uid + ' .score');

        score_el.text(score);

        if(score == self.opts.max_score)
        {
            self.end(player_opts);
        }

    },

    /*
     * Set some styles for our stage. Height etc. This creates the bounds
     * of where the balloons float in.
     */
    setStageStyles: function()
    {

        var self = this;

        self.opts.elements.stage.css({
            height: $(document).height(),
            position: 'relative'
        });

    },

    /*
     * Set the background of our scoreboard, random color.
     */
    setScoreboardStyles: function()
    {

        var self = this;

        self.opts.elements.score_board.find('.score').css('background', self.player_opts.explosion_color);

    },

    /*
     * Draw our balloon onto the stage
     */
    drawBalloon: function()
    {
        var self = this;

        var balloon = new self.opts.balloon({
            explosion_color: self.player_opts.explosion_color
        });

        var markup = balloon.getMarkup();
        var balloon_id = balloon.getId();
        var doc_height = $(document).height();
        var doc_width = $(document).width();
        var anim_speed = Utils.randomFromTo(7000, 10000);
        var bottom_offset = 100;

        self.opts.elements.stage.append(markup);

        $('#' + balloon_id).css({
            left: Utils.randomFromTo(1, doc_width),
            bottom: -bottom_offset
        }).animate({
            bottom: doc_height,
            left: Utils.randomFromTo(1, doc_width)
        },
        {
            step: function(){
                //log(arguments);
            },
            duration: anim_speed,
            complete: function(){
                balloon.destroy();
            }
        }).data('BalloonInstance', balloon);

    }

}