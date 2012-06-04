var log = function(){ return console.log.apply(console, arguments); }
var Utils = {
    randomFromTo: function(from, to){
       return Math.floor(Math.random() * (to - from + 1) + from);
    },
    generateUniqueID: function(len)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        if(!len)
        {
            len = 15;
        }

        for(var i = 0; i < len; i++)
        {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
}