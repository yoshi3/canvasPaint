var React = require('react');
var ReactDOM  = require('react-dom');

var w = 600;
var h = 600;
var m = 2;

var wrap = document.getElementById('canvas');
var c = document.createElement('canvas');
c.m = m;
c.w = c.width = w * c.m;
c.h = c.height = h * c.m;
c.style.width = w +'px';
c.style.height = h +'px';
var ctx = c.getContext('2d');
wrap.appendChild(c);
var rect = c.getBoundingClientRect();
c.x = rect.left * c.m;
c.y = rect.top * c.m;
c.gx = function (p) { return p*m-this.x; };
c.gy = function (p) { return p*m-this.y; };

var isDrawing;
var lineWidth = 1;
var scRange = 2;

var sum = function (ary) {
  var sum = 0, i = 0, ii = ary.length;
  for(; i < ii; i++){
    sum += ary[i];
  }
  return sum;
};
var average = function (arr, fn) {
  return sum(arr, fn)/arr.length;
};
var pastX = [];
var pastY = [];

var pointer = {
  handler_list: {},
  isDrag: false,
  init: function (c) {
    c.addEventListener('mousedown', function (e) {
      this.isDrag = true;
      this.executeHandler('moveStart', c.gx(e.clientX), c.gy(e.clientY));
    }.bind(this));
    c.addEventListener('mousemove', function (e) {
      if (!this.isDrag) return;
      this.executeHandler('move', c.gx(e.clientX), c.gy(e.clientY));
    }.bind(this));
    c.addEventListener('mouseup', function (e) {
      this.isDrag = false;
      this.executeHandler('moveEnd', c.gx(e.clientX), c.gy(e.clientY));
    }.bind(this));
    c.addEventListener('touchstart', function (e) {
      this.isDrag = true;
      this.executeHandler('moveStart', c.gx(e.touches[0].clientX), c.gy(e.touches[0].clientY));
    }.bind(this));
    c.addEventListener('touchmove', function (e) {
      if (!this.isDrag) return;
      this.executeHandler('move', c.gx(e.touches[0].clientX), c.gy(e.touches[0].clientY));
    }.bind(this));
    c.addEventListener('touchend', function (e) {
      this.isDrag = false;
      this.executeHandler('moveEnd');
    }.bind(this));
  },
  addHandler: function (type, handler) {
    if (!this.handler_list[type]) this.handler_list[type] = [];
    this.handler_list[type].push(handler);
  },
  executeHandler: function (type, x, y) {
    if (!this.handler_list[type]) return;
    var i = 0;
    var ii = this.handler_list[type].length;
    while(i < ii) {
      this.handler_list[type][i](x, y);
    i=(i+1)|0; }
  }
};

var history = {
  redo_list: [],
  undo_list: [],
  saveState: function(canvas, list, keep_redo) {
    keep_redo = keep_redo || false;
    if(!keep_redo) {
      this.redo_list = [];
    }
    
    (list || this.undo_list).push(canvas.toDataURL());
  },
  undo: function(canvas, ctx) {
    console.log('undo');
    this.restoreState(canvas, ctx, this.undo_list, this.redo_list);
  },
  redo: function(canvas, ctx) {
    this.restoreState(canvas, ctx, this.redo_list, this.undo_list);
  },
  restoreState: function(canvas, ctx,  pop, push) {
    if(pop.length) {
      this.saveState(canvas, push, true);
      var restore_state = pop.pop();
      var img = document.createElement('img');
      img.src = restore_state;
      img.onload = function() {
        ctx.clearRect(0, 0, c.w, c.h);
        ctx.drawImage(img, 0, 0, c.w, c.h, 0, 0, c.w, c.h);
      };
    }
  }
}

var pos = { x: [], y: [] };
var ave = { x: [], y: [] };
var mid_x;
var mid_y;
var mid_x_old;
var mid_y_old;

pointer.init(c);
pointer.addHandler('moveStart', function(x, y) {
  history.saveState(c);

  isDrawing = true;
  pos.x = [];
  pos.y = [];
  ave.x = [];
  ave.y = [];
  pos.x.push(x);
  pos.y.push(y);
  ave.x.push(x);
  ave.y.push(y);
  mid_x_old = x;
  mid_y_old = y;
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = ctx.lineCap = 'round';
});
pointer.addHandler('move', function(x, y) {
  if (isDrawing) {
    var now = pos.x.length;
    var old = now-1;
    pos.x.push(x);
    pos.y.push(y);
    if (now < scRange+1) {
      ave.x.push( ( average( pos.x.slice(0, now) ) + 0.5 )>>0 );
      ave.y.push( ( average( pos.y.slice(0, now) ) + 0.5 )>>0 );
    } else {
      ave.x.push( ( average( pos.x.slice(now-scRange-1, now) ) + 0.5 )>>0 );
      ave.y.push( ( average( pos.y.slice(now-scRange-1, now) ) + 0.5 )>>0 );
    }
    mid_x = (ave.x[old] + ave.x[now]) / 2;
    mid_y = (ave.y[old] + ave.y[now]) / 2;
    ctx.moveTo(mid_x_old, mid_y_old);
    ctx.quadraticCurveTo(ave.x[old], ave.y[old], mid_x, mid_y);
    ctx.stroke();
    mid_x_old = mid_x;
    mid_y_old = mid_y;
  }
});
pointer.addHandler('moveEnd', function(x, y) {
  isDrawing = false;
  var old = pos.x.length-1;
  mid_x = (ave.x[old] + x) / 2;
  mid_y = (ave.y[old] + y) / 2;
  ctx.moveTo(mid_x_old, mid_y_old);
  ctx.quadraticCurveTo(ave.x[old], ave.y[old], mid_x, mid_y);
  ctx.stroke();
});

var Counter = React.createClass({
  getInitialState: function () {
    return { 
      lineWidth: lineWidth,
      scRange: scRange
    };
  },
  handleLineWidth: function (e) {
    this.setState({
      lineWidth: e.target.value
    });
    lineWidth = Number(e.target.value);
  },
  handleScRange: function (e) {
    this.setState({
      scRange: e.target.value
    });
    scRange = Number(e.target.value);
  },
  clear: function (e) {
    ctx.clearRect(0, 0, c.w, c.h);
  },
  undo: function (e) {
    history.undo(c, ctx);
  },
  redo: function (e) {
    history.redo(c, ctx);
  },
  render: function () {
    return (
      <div>
        <p>太さ</p>
        <input type="range" min="1" max="50" step="1" value={this.state.lineWidth} onChange={this.handleLineWidth} />
        <div>{this.state.lineWidth}</div>
        <p>手振れ補正</p>
        <input type="range" min="1" max="20" step="1" value={this.state.scRange} onChange={this.handleScRange} />
        <div>{this.state.scRange}</div>
        <button onClick={this.clear}>clear</button>
        <button onClick={this.undo}>undo</button>
        <button onClick={this.redo}>redo</button>
      </div>
    );
  }
});
ReactDOM.render(
<Counter />,
document.getElementById('container')
);