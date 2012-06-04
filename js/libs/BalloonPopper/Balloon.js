/*
 * Constructor to create a new balloon
 *
 * @param {Object} opts The balloon options
 */
var Balloon = function(opts)
{

    var self = this;

    // Some default options to be filled in
    var default_opts = {
        explosion_color: ''
    };

    self.opts = $.extend(true, {}, default_opts, opts);

    self._id = 'balloon-' + Utils.randomFromTo(1, 999999);

}

Balloon.prototype = {

    /*
     * Get the HTML marup for the balloon we're about to draw to the screen
     */
    getMarkup: function()
    {

        var self = this;
        var html_markup = '<div id="' + self._id + '" class="balloon"></div>';

        return html_markup;

    },

    /*
     * Get the id of the current balloon
     */
    getId: function()
    {

        var self = this;

        return self._id;

    },

    /*
     * Destroy the current ballon. Either because it went off the
     * screen or because we clicked on it.
     *
     * @param {Object} opts Any options. Includes opts.explode if we want to apply an effect
     */
    destroy: function(opts)
    {

        var self = this;

        if(opts && opts.explode)
        {
            $('#' + self.getId()).css('background', self.opts.explosion_color).stop().effect('explode', {
                pieces: 16
            }, 500, function(){
                self._remove();
            });
        }
        else
        {
            self._remove();
        }

    },

    /*
     * Only called internally. Removing a balloon should be called by destroy()
     */
    _remove: function()
    {

        var self = this;

        $('#' + self.getId()).remove();

    }

}