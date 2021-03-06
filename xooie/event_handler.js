/*
*   Copyright 2012 Comcast
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

define('xooie/event_handler', ['jquery', 'xooie/helpers'], function($, helpers) {

  var EventHandler = function(namespace) {
    this.namespace = namespace;

    this.handlers = {};

    this._callbacks = {};
  };

  function format(type, namespace) {
    if (typeof namespace === 'undefined') {
      return type;
    } else {
      return type + '.' + namespace;
    }
  }

  EventHandler.prototype.add = function(type, method) {
    var self = this,
        formattedType, t;

    if (helpers.isObject(type) && helpers.isUndefined(method)) {
      for(t in type) {
        if (helpers.isFunction(type[t])) {
          this.add(t, type[t]);
        }
      }

      return;
    }

    formattedType = format(type, this.namespace);

    if (helpers.isUndefined(this.handlers[formattedType])) {
      this.handlers[formattedType] = function(e) {
        self.fire(e, this, arguments);
      };
    }

    if (helpers.isUndefined(this._callbacks[type])) {
      this._callbacks[type] = $.Callbacks('unique');
    }

    this._callbacks[type].add(method);
  };

  EventHandler.prototype.clear = function(type) {
    delete(this.handlers[format(type, this.namespace)]);

    if (!helpers.isUndefined(this._callbacks[type])) {
      this._callbacks[type].empty();
    }
  };

  EventHandler.prototype.fire = function(event, context, args) {
    if (event.namespace && event.namespace !== this.namespace) {
      return;
    }

    if (!helpers.isUndefined(this._callbacks[event.type])) {
      this._callbacks[event.type].fireWith(context, args);
    }
  };

  return EventHandler;
});