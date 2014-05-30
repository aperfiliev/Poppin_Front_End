// Backbone.History.js
// -----------------
// Extends native Backbone.History to override the getFragment to include the location.search
(function ()
{  
  'use strict';

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;
  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  //Add query string parameters in case of using push state
  _.extend(Backbone.History.prototype, {
      getFragment: function(fragment, forcePushState) {
        if (!fragment)
        {
          if (this._hasPushState || !this._wantsHashChange || forcePushState)
          {
            fragment = this.location.pathname + this.location.search;
            var root = this.root.replace(trailingSlash, '');
            if (!fragment.indexOf(root))
            {
              fragment = fragment.substr(root.length);
            }
          } 
          else 
          {
            fragment = this.getHash();
          }
        }
        return fragment.replace(routeStripper, '');
      }
  });
})();