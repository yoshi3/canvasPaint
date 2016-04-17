var eCanvas = document.createElement('canvas');
eCanvas.width = 600;
eCanvas.height = 600;
var ctx = eCanvas.getContext('2d');
document.body.appendChild(eCanvas);

var Stage = function () {
  
};

var Cursor = function () {
  this.x;
  this.y;
  this.lx;
  this.ly;
  this.isDlag = false;
  this.eCanvas;
  this.eCanvasRect;
};
Cursor.prototype.init = function (eCanvas) {
  var self = this;
  self.eCanvas = eCanvas;
  self.eCanvasRect = self.eCanvas.getBoundingClientRect();

  self.eCanvas.addEventListener('mousemove', function(event){
    self.x = event.clientX - self.eCanvasRect.left;
    self.y = event.clientY - self.eCanvasRect.top;
  });
  self.eCanvas.addEventListener('mousedown', function(event){
    self.isDlag = true;
    self.lx = self.x;
    self.ly = self.y;
  });
  self.eCanvas.addEventListener('mouseup', function(event){
    self.isDlag = false;
  });
};

var cursor = new Cursor();
cursor.init(eCanvas);

eCanvas.addEventListener('mousemove', function(event){
  if (cursor.isDlag) {
    ctx.beginPath();
    ctx.moveTo(cursor.lx, cursor.ly);
    ctx.lineTo(cursor.x, cursor.y);
    ctx.lineCap = 'round';
    ctx.stroke();
    cursor.lx = cursor.x;
    cursor.ly = cursor.y;
  }
});