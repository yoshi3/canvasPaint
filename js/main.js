var canvas = document.getElementById('canvas');
var el = document.createElement('canvas');
el.width = 1200;
el.height = 1200;
el.style.width = 600 +'px';
el.style.height = 600 +'px';
var ctx = el.getContext('2d');
canvas.appendChild(el);
var rect = el.getBoundingClientRect();

var isDrawing;

el.onmousedown = function(e) {
  console.log(e.clientX);
  isDrawing = true;
  ctx.lineWidth = 1;
  ctx.lineJoin = ctx.lineCap = 'round';
  ctx.moveTo(e.clientX*2-rect.left*2, e.clientY*2-rect.top*2);
};
el.onmousemove = function(e) {
  if (isDrawing) {
    ctx.lineTo(e.clientX*2-rect.left*2, e.clientY*2-rect.top*2);
    ctx.stroke();
  }
};
el.onmouseup = function() {
  isDrawing = false;
};