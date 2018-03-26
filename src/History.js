class History {
  constructor () {
    this.redo_list = [];
    this.undo_list = [];
  }
  saveState (canvas, list, keep_redo) {
    keep_redo = keep_redo || false;
    if(!keep_redo) {
      this.redo_list = [];
    }
    
    (list || this.undo_list).push(canvas.toDataURL());
  }
  undo (canvas, ctx) {
    this.restoreState(canvas, ctx, this.undo_list, this.redo_list);
  }
  redo (canvas, ctx) {
    this.restoreState(canvas, ctx, this.redo_list, this.undo_list);
  }
  restoreState (canvas, ctx,  pop, push) {
    if(pop.length) {
      this.saveState(canvas, push, true);
      const img = document.createElement('img');
      img.src = pop.pop();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.w, canvas.h);
        ctx.drawImage(img, 0, 0, canvas.w, canvas.h, 0, 0, canvas.w, canvas.h);
      };
    }
  }
}
export default History;