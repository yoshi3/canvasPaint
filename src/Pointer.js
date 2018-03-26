class Pointer {
  constructor (canvas) {
    this.canvas = canvas;
    this.isDrag = false;
    this.handler_list = {};
    this._setEvents();
  }
  addHandler (type, handler) {
    if (!this.handler_list[type]) this.handler_list[type] = [];
    this.handler_list[type].push(handler);
  }
  _setEvents () {
    this.canvas.addEventListener('mousedown', event => {
      this.isDrag = true;
      this._executeHandler('moveStart', this.canvas.gx(event.clientX), this.canvas.gy(event.clientY));
    });
    this.canvas.addEventListener('mousemove', event => {
      if (!this.isDrag) return;
      this._executeHandler('move', this.canvas.gx(event.clientX), this.canvas.gy(event.clientY));
    });
    this.canvas.addEventListener('mouseup', event => {
      this.isDrag = false;
      this._executeHandler('moveEnd', this.canvas.gx(event.clientX), this.canvas.gy(event.clientY));
    });
    this.canvas.addEventListener('touchstart', event => {
      this.isDrag = true;
      this._executeHandler('moveStart', this.canvas.gx(event.touches[0].clientX), this.canvas.gy(event.touches[0].clientY));
    });
    this.canvas.addEventListener('touchmove', event => {
      if (!this.isDrag) return;
      this._executeHandler('move', this.canvas.gx(event.touches[0].clientX), this.canvas.gy(event.touches[0].clientY));
    });
    this.canvas.addEventListener('touchend', event => {
      this.isDrag = false;
      this._executeHandler('moveEnd');
    });
  }
  _executeHandler (type, x, y) {
    if (!this.handler_list[type]) return;
    let i = 0;
    let ii = this.handler_list[type].length;
    while(i < ii) {
      this.handler_list[type][i](x, y);
    i=(i+1)|0; }
  }
};

export default Pointer;