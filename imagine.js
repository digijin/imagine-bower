if (!window.console) {
  window.console = log(function() {});
}
;
var typeIsArray;

typeIsArray = Array.isArray || function(value) {
  return {}.toString.call(value) === '[object Array]';
};
;
var isElement, isNode;

isNode = function(o) {
  if (typeof Node === "object") {
    return o instanceof Node;
  } else {
    return o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string";
  }
};

isElement = function(o) {
  if (typeof HTMLElement === "object") {
    return o instanceof HTMLElement;
  } else {
    return o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
  }
};
;
(function() {
  var lastTime, vendors, x;
  lastTime = 0;
  vendors = ["ms", "moz", "webkit", "o"];
  x = 0;
  while (x < vendors.length && !window.requestAnimationFrame) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    ++x;
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime, id, timeToCall;
      currTime = new Date().getTime();
      timeToCall = Math.max(0, 16 - (currTime - lastTime));
      id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
})();
;
var Imagine,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Imagine = (function() {
  function Imagine(params) {
    return Imagine.process(params);
  }

  Imagine.objects = [];

  Imagine.process = function(params) {
    var el, i, out;
    if (Object.prototype.toString.call(params) === "[object Array]") {
      i = 0;
      while (i < params.length) {
        Imagine.process(params[i]);
        i++;
      }
    } else {
      if (isElement(params)) {
        el = new Imagine.Element(params);
        out = Imagine.process({}).addComponent(el);
      } else {
        out = Imagine.engine.registerObject(params);
      }
    }
    return out;
  };

  Imagine.addEvent = function(element, eventName, callback) {
    if (element.addEventListener) {
      element.addEventListener(eventName, callback, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + eventName, callback);
    } else {
      element["on" + eventName] = callback;
    }
  };

  Imagine.getComponent = function(name) {
    var com, obj, _i, _len, _ref;
    _ref = Imagine.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obj = _ref[_i];
      com = obj.getComponent(name);
      if (com) {
        return com;
      }
    }
  };

  Imagine.getComponents = function(name) {
    var com, obj, out, _i, _len, _ref;
    out = [];
    _ref = Imagine.objects;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obj = _ref[_i];
      com = obj.getComponent(name);
      if (com) {
        out.push(com);
      }
    }
    return out;
  };

  Imagine.notify = function(func) {
    var obj, _i, _len, _ref, _results;
    _ref = Imagine.objects;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obj = _ref[_i];
      _results.push(obj.notify(func));
    }
    return _results;
  };

  Imagine.destroy = function(obj) {
    var ind;
    obj = obj._object || obj;
    if (__indexOf.call(Imagine.objects, obj) >= 0) {
      ind = Imagine.objects.indexOf(obj);
      return Imagine.objects.splice(ind, 1);
    }
  };

  return Imagine;

})();
;
Imagine.component = {};
;
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Imagine.Engine = (function() {
  Engine.prototype.fps = 0;

  Engine.prototype.frameGap = 1000 / Engine.fps;

  Engine.prototype.inited = false;

  Engine.prototype.updateId = void 0;

  function Engine() {
    setTimeout(this.init, 0);
  }

  Engine.prototype.init = function() {
    var d;
    if (!this.inited) {
      this.inited = true;
      d = new Date();
      Imagine.time.startTime = d.getTime();
      Imagine.time.lastTime = Imagine.time.startTime;
      Imagine.engine.setFPS(this.fps);
    }
  };

  Engine.prototype.update = function() {
    var com, i, key, obj;
    Imagine.time.update();
    Imagine.Input.update();
    i = 0;
    while (i < Imagine.objects.length) {
      obj = Imagine.objects[i];
      if (obj._components) {
        for (key in obj._components) {
          if (obj._components.hasOwnProperty(key)) {
            com = obj._components[key];
            if (com.update) {
              com.update();
            }
          }
        }
      }
      i++;
    }
    if (this.fps === 0) {
      this.updateId = requestAnimationFrame(this.update);
    }
  };

  Engine.prototype.forceUpdate = function() {
    return this.update();
  };

  Engine.prototype.clearUpdate = function() {
    clearInterval(this.updateId);
    cancelAnimationFrame(this.updateId);
  };

  Engine.prototype.setFPS = function(newFPS) {
    this.fps = newFPS;
    Imagine.engine.clearUpdate();
    if (this.fps === 0) {
      this.frameGap = 0;
      this.updateId = requestAnimationFrame(this.update);
    } else {
      this.frameGap = 1000 / this.fps;
      this.updateId = setInterval(this.update, this.frameGap);
    }
  };

  Engine.prototype.addComponent = function(com) {
    var c1, c2, obj, _i, _j, _len, _len1, _ref, _ref1;
    if (!com) {
      console.log("component not defined");
      return this;
    }
    obj = this._object || this;
    com._object = obj;
    if (!obj._components) {
      obj._components = [];
    }
    obj._components.push(com);
    Imagine.engine.assignfunctions(com);
    _ref = obj._components;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c1 = _ref[_i];
      if (c1._register) {
        _ref1 = obj._components;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          c2 = _ref1[_j];
          if (!c2[c1._register]) {
            c2[c1._register] = c1;
          }
        }
      }
    }
    if (com.start) {
      com.start();
    }
    return com;
  };

  Engine.prototype.getComponent = function(name) {
    var com, obj, _i, _len, _ref;
    obj = this._object || this;
    if (obj._components) {
      _ref = obj._components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        com = _ref[_i];
        if (com.name === name) {
          return com;
        }
      }
    }
  };

  Engine.prototype.getTag = function(name) {
    var com, obj, tag, _i, _j, _len, _len1, _ref, _ref1;
    obj = this._object || this;
    if (obj._components) {
      _ref = obj._components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        com = _ref[_i];
        if (com.tags) {
          _ref1 = com.tags;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            tag = _ref1[_j];
            if (tag === name) {
              return com;
            }
          }
        }
      }
    }
  };

  Engine.prototype.addTag = function(name) {
    if (!this.tags) {
      this.tags = [];
    }
    this.tags.push(name);
    return this;
  };

  Engine.prototype.hasTag = function(name) {
    return __indexOf.call(this.tags, name) >= 0;
  };

  Engine.prototype.removeTag = function(name) {};

  Engine.prototype.notify = function(event, arg) {
    var com, obj, _i, _len, _ref, _results;
    obj = this._object || this;
    if (obj._components) {
      _ref = obj._components;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        com = _ref[_i];
        if (com[event]) {
          if (typeof com[event] === "function") {
            _results.push(com[event].apply(com, [arg]));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  Engine.prototype.assignfunctions = function(obj) {
    var com, _i, _len, _ref, _results;
    obj.addComponent = this.addComponent;
    obj.getComponent = this.getComponent;
    obj.getTag = this.getTag;
    obj.addTag = this.addTag;
    obj.hasTag = this.hasTag;
    obj.removeTag = this.removeTag;
    obj.notify = this.notify;
    if (obj.requireComponent) {
      if (Imagine.utils.typeIsArray(obj.requireComponent)) {
        _ref = obj.requireComponent;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          com = _ref[_i];
          _results.push(obj.addComponent(new com()));
        }
        return _results;
      } else {
        return obj.addComponent(new obj.requireComponent());
      }
    }
  };

  Engine.prototype.reset = function() {
    Imagine.objects = [];
    Imagine.Input.reset();
    Imagine.time.paused = false;
    this.inited = false;
    this.clearUpdate();
    this.init();
  };

  Engine.prototype.registerObject = function(obj) {
    var c, key;
    obj._components = [obj];
    Imagine.objects.push(obj);
    Imagine.engine.assignfunctions(obj);
    if (obj.start) {
      obj.start();
    }
    if (obj.component) {
      for (key in obj.component) {
        if (obj.component.hasOwnProperty(key)) {
          c = obj.component[key];
          obj.addComponent(c);
        }
      }
    }
    return obj;
  };

  Engine.prototype.getFPS = function() {
    return this.fps;
  };

  return Engine;

})();

Imagine.engine = new Imagine.Engine();
;
Imagine.InputAbstract = (function() {
  InputAbstract.prototype.axes = {};

  InputAbstract.prototype.mapping = {};

  InputAbstract.prototype.keyStatus = {};

  InputAbstract.prototype.keyChanging = {};

  InputAbstract.prototype.keyChanged = {};

  function InputAbstract() {
    Imagine.addEvent(document, "keypress", function(e) {
      var keyCode;
      e = e || window.event;
      keyCode = (e.keyCode ? e.keyCode : e.charCode);
      Imagine.Input.keypress(keyCode);
    });
    Imagine.addEvent(document, "keyup", function(e) {
      var keyCode;
      e = e || window.event;
      keyCode = (e.keyCode ? e.keyCode : e.charCode);
      Imagine.Input.keyup(keyCode);
    });
    Imagine.addEvent(document, "keydown", function(e) {
      var keyCode;
      e = e || window.event;
      keyCode = (e.keyCode ? e.keyCode : e.charCode);
      Imagine.Input.keydown(keyCode);
    });
    this.init();
  }

  InputAbstract.prototype.keypress = function(keyCode) {};

  InputAbstract.prototype.keyup = function(keyCode) {
    var com, i, obj, _i, _len, _ref;
    Imagine.notify('onKeyUp', keyCode);
    keyCode = this.map(keyCode);
    this.keyStatus[keyCode] = false;
    this.keyChanging[keyCode] = "up";
    i = 0;
    while (i < Imagine.objects.length) {
      obj = Imagine.objects[i];
      if (obj._components) {
        _ref = obj._components;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          com = _ref[_i];
          if (com.keyup) {
            com.keyup(keyCode);
          }
        }
      }
      i++;
    }
  };

  InputAbstract.prototype.keydown = function(keyCode) {
    var com, firstdown, i, obj, _i, _len, _ref;
    Imagine.notify('onKeyDown', keyCode);
    keyCode = this.map(keyCode);
    firstdown = false;
    if (this.keyStatus.hasOwnProperty(keyCode)) {
      if (this.keyStatus[keyCode] !== true) {
        firstdown = true;
        this.keyChanging[keyCode] = "down";
      }
    } else {
      firstdown = true;
      this.keyChanging[keyCode] = "down";
    }
    if (firstdown) {
      i = 0;
      while (i < Imagine.objects.length) {
        obj = Imagine.objects[i];
        if (obj._components) {
          _ref = obj._components;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            com = _ref[_i];
            if (com.keydown) {
              com.keydown(keyCode);
            }
          }
        }
        i++;
      }
    }
    this.keyStatus[keyCode] = true;
  };

  InputAbstract.prototype.defaults = {
    axes: {
      Horizontal: {
        positive: "right",
        negative: "left"
      },
      Vertical: {
        positive: "up",
        negative: "down"
      }
    },
    mapping: {
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      shift: 16,
      enter: 13,
      ctrl: 17,
      escape: 27
    }
  };

  InputAbstract.prototype.init = function(params) {
    this.config = JSON.parse(JSON.stringify(this.defaults));
    this.axes = this.config.axes;
    this.mapping = this.config.mapping;
  };

  InputAbstract.prototype.reset = function() {
    this.keyStatus = {};
    this.keyChanging = {};
    this.keyChanged = {};
  };

  InputAbstract.prototype.map = function(key) {
    if (typeof key === "number") {
      return key;
    }
    if (this.mapping.hasOwnProperty(key)) {
      return this.mapping[key];
    }
    return parseInt(key);
  };

  InputAbstract.prototype.isDown = function(keyCode) {
    keyCode = this.map(keyCode);
    if (this.keyStatus.hasOwnProperty(keyCode)) {
      return this.keyStatus[keyCode];
    }
    return false;
  };

  InputAbstract.prototype.getKey = function(keyCode) {
    return this.isDown(keyCode);
  };

  InputAbstract.prototype.getKeyDown = function(keyCode) {
    keyCode = this.map(keyCode);
    if (this.keyChanged.hasOwnProperty(keyCode)) {
      if (this.keyChanged[keyCode] === "down") {
        return true;
      }
    }
    return false;
  };

  InputAbstract.prototype.getKeyUp = function(keyCode) {
    keyCode = this.map(keyCode);
    if (this.keyChanged.hasOwnProperty(keyCode)) {
      if (this.keyChanged[keyCode] === "up") {
        return true;
      }
    }
    return false;
  };

  InputAbstract.prototype.getAxis = function(axis) {
    var neg, pos;
    pos = this.isDown(this.axes[axis].positive);
    neg = this.isDown(this.axes[axis].negative);
    return (pos ? 1 : 0) + (neg ? -1 : 0);
  };

  InputAbstract.prototype.update = function() {
    this.keyChanged = this.keyChanging;
    this.keyChanging = {};
  };

  InputAbstract.prototype.addAxis = function(axisName, axis) {
    this.axes[axisName] = axis;
  };

  return InputAbstract;

})();

Imagine.Input = new Imagine.InputAbstract();
;
Imagine.TimeAbstract = (function() {
  function TimeAbstract() {}

  TimeAbstract.prototype.paused = false;

  TimeAbstract.prototype.deltaTime = 0;

  TimeAbstract.prototype.currentTime = 0;

  TimeAbstract.prototype.lastTime = 0;

  TimeAbstract.prototype.startTime = 0;

  TimeAbstract.prototype.pause = function(toPause) {
    if (toPause || !toPause) {
      this.paused = !this.paused;
    }
    if (this.paused) {
      return Imagine.engine.clearUpdate();
    } else {
      return Imagine.engine.setFPS(Imagine.engine.getFPS());
    }
  };

  TimeAbstract.prototype.update = function() {
    var d, dt;
    d = new Date();
    dt = d.getTime();
    Imagine.time.currentTime = dt - Imagine.time.startTime;
    Imagine.time.deltaTime = (dt - Imagine.time.lastTime) / 1000;
    return Imagine.time.lastTime = dt;
  };

  return TimeAbstract;

})();

Imagine.time = new Imagine.TimeAbstract();
;
Imagine.Utils = (function() {
  function Utils() {}

  Utils.prototype.typeIsArray = Array.isArray || function(value) {
    return {}.toString.call(value) === '[object Array]';
  };

  return Utils;

})();

Imagine.utils = new Imagine.Utils();
;
Imagine.FPS = (function() {
  function FPS() {}

  FPS.prototype.lastFPS = [];

  FPS.prototype.update = function() {
    var fps, reading, _i, _len, _ref;
    this.lastFPS.push(1 / Imagine.time.deltaTime);
    if (this.lastFPS.length > 10) {
      fps = 0;
      _ref = this.lastFPS;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        reading = _ref[_i];
        fps += reading;
      }
      fps = Math.floor(fps / this.lastFPS.length);
      this.lastFPS = [];
      return $(this.element.raw).html(fps + "FPS");
    }
  };

  return FPS;

})();
;
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Imagine.Collider = (function() {
  function Collider() {}

  Collider.prototype.ignoreSides = [];

  Collider.prototype.name = 'collider';

  Collider.prototype.tags = ['collider'];

  Collider.prototype._register = 'collider';

  Collider.prototype.isTrigger = false;

  Collider.prototype.start = function() {
    this.element = this.getComponent("element");
  };

  Collider.prototype.move = function(x, y) {
    var check, coll, collision, collisions, colls, el, height, obj, pos, side, width, _i, _j, _len, _len1;
    pos = this.element.raw.getBoundingClientRect();
    check = {
      top: pos.top,
      right: pos.right,
      bottom: pos.bottom,
      left: pos.left
    };
    if (y < 0) {
      check.top += y;
    } else {
      check.bottom += y;
    }
    if (x < 0) {
      check.left += x;
    } else {
      check.right += x;
    }
    colls = Imagine.getComponents('collider');
    collisions = [];
    for (_i = 0, _len = colls.length; _i < _len; _i++) {
      coll = colls[_i];
      if (!(this === coll)) {
        el = coll.getComponent('element');
        if (el) {
          obj = el.raw.getBoundingClientRect();
          if (this.compareSquares(check, obj)) {
            collision = {
              side: [],
              collider: coll
            };
            height = pos.height || pos.bottom - pos.top;
            width = pos.width || pos.right - pos.left;
            if (pos.bottom <= obj.top && check.bottom > obj.top && !(__indexOf.call(coll.ignoreSides, "top") >= 0)) {
              if (!(this.isTrigger || coll.isTrigger)) {
                y = (obj.top - height) - check.top;
              }
              collision.side.push('top');
            } else if (obj.bottom <= pos.top && check.top < obj.bottom && !(__indexOf.call(coll.ignoreSides, "bottom") >= 0)) {
              if (!(this.isTrigger || coll.isTrigger)) {
                y = obj.bottom - pos.top;
              }
              collision.side.push('bottom');
            }
            if (pos.right <= obj.left && check.right > obj.left && !(__indexOf.call(coll.ignoreSides, "left") >= 0)) {
              if (!(this.isTrigger || coll.isTrigger)) {
                x = (obj.left - width) - check.left;
              }
              collision.side.push('left');
            } else if (obj.right <= pos.left && check.left < obj.right && !(__indexOf.call(coll.ignoreSides, "right") >= 0)) {
              if (!(this.isTrigger || coll.isTrigger)) {
                x = obj.right - pos.left;
              }
              collision.side.push('right');
            }
            if (collision.side.length > 0) {
              collisions.push(collision);
            }
          }
        }
      }
    }
    this.element.move(x, y);
    for (_j = 0, _len1 = collisions.length; _j < _len1; _j++) {
      coll = collisions[_j];
      this.notify('onCollision', coll);
      side = coll.side.map(function(obj) {
        switch (obj) {
          case "left":
            return "right";
          case "right":
            return "left";
          case "top":
            return "bottom";
          case "bottom":
            return "top";
        }
      });
      coll.collider.notify('onCollision', {
        side: side,
        collider: this
      });
    }
    switch (collisions.length) {
      case 0:
        return;
      case 1:
        return collisions[0];
      default:
        side = collisions.map(function(i) {
          return i.side[0];
        });
        return {
          side: side,
          collisions: collisions
        };
    }
  };

  Collider.prototype.collidesWith = function(obj) {
    var myrect, obrect;
    myrect = this.element.getBoundingClientRect();
    obrect = obj.getBoundingClientRect();
    return this.compareSquares(myrect, obrect);
  };

  Collider.prototype.compareSquares = function(sq1, sq2) {
    var outsideH, outsideV;
    outsideH = sq1.bottom <= sq2.top || sq2.bottom <= sq1.top;
    outsideV = sq1.right <= sq2.left || sq2.right <= sq1.left;
    return !outsideV && !outsideH;
  };

  return Collider;

})();
;
Imagine.Element = (function() {
  Element.prototype.name = "element";

  Element.prototype.tags = ['element'];

  Element.prototype._register = 'element';

  function Element(raw) {
    this.raw = raw;
    if (!isElement(this.raw)) {
      throw new Error("Not a HTML object");
    }
    this.raw.getLocalRect = this.getLocalRect;
    this.raw.move = this.move;
    this.raw.moveTo = this.moveTo;
  }

  Element.prototype.getLocalRect = function() {
    var parent, prect, rect;
    rect = this.raw.getBoundingClientRect();
    parent = this.raw.parentNode;
    if (parent) {
      prect = parent.getBoundingClientRect();
      rect = {
        right: rect.right - prect.left,
        bottom: rect.bottom - prect.top,
        top: rect.top - prect.top,
        left: rect.left - prect.left,
        height: rect.bottom - rect.top,
        width: rect.right - rect.left
      };
    }
    return rect;
  };

  Element.prototype.posInit = function() {
    return this._pos = {
      left: this.raw.offsetLeft,
      top: this.raw.offsetTop
    };
  };

  Element.prototype.getPosition = function() {
    if (!this._pos) {
      this.posInit();
    }
    return this._pos;
  };

  Element.prototype.setPosition = function(x, y) {
    this._pos = {
      'left': x,
      'top': y
    };
    this.raw.style.top = y + "px";
    this.raw.style.left = x + "px";
    return this;
  };

  Element.prototype.moveTo = function(x, y) {
    return this.setPosition(x, y);
  };

  Element.prototype.move = function(x, y) {
    var pos;
    pos = this.getPosition();
    return this.setPosition(pos.left + x, pos.top + y);
  };

  return Element;

})();
