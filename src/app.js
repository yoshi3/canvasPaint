import React from 'react';
import ReactDOM from 'react-dom';
import Util from './Util';
import Pointer from './Pointer';
import History from './History';

const w = 600;
const h = 600;
const m = 2;

const wrap = document.getElementById('wrap');
const c = document.createElement('canvas');
c.m = m;
c.w = c.width = w * c.m;
c.h = c.height = h * c.m;
c.style.width = w +'px';
c.style.height = h +'px';
const ctx = c.getContext('2d');
wrap.appendChild(c);
const rect = c.getBoundingClientRect();
c.x = rect.left * c.m;
c.y = rect.top * c.m;
c.gx = p => p*m-c.x;
c.gy = p => p*m-c.y;

let isDrawing;
let lineWidth = 1;
let scRange = 2;

const pointer = new Pointer(c);
const history = new History();

const pastX = [];
const pastY = [];

var pos = { x: [], y: [] };
var ave = { x: [], y: [] };
var mid_x;
var mid_y;
var mid_x_old;
var mid_y_old;

pointer.addHandler('moveStart', (x, y) => {
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
pointer.addHandler('move', (x, y) => {
  if (isDrawing) {
    var now = pos.x.length;
    var old = now-1;
    pos.x.push(x);
    pos.y.push(y);
    if (now < scRange+1) {
      ave.x.push( ( Util.average( pos.x.slice(0, now) ) + 0.5 )>>0 );
      ave.y.push( ( Util.average( pos.y.slice(0, now) ) + 0.5 )>>0 );
    } else {
      ave.x.push( ( Util.average( pos.x.slice(now-scRange-1, now) ) + 0.5 )>>0 );
      ave.y.push( ( Util.average( pos.y.slice(now-scRange-1, now) ) + 0.5 )>>0 );
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
pointer.addHandler('moveEnd', (x, y) => {
  isDrawing = false;
  var old = pos.x.length-1;
  mid_x = (ave.x[old] + x) / 2;
  mid_y = (ave.y[old] + y) / 2;
  ctx.moveTo(mid_x_old, mid_y_old);
  ctx.quadraticCurveTo(ave.x[old], ave.y[old], mid_x, mid_y);
  ctx.stroke();
});

const Counter = React.createClass({
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