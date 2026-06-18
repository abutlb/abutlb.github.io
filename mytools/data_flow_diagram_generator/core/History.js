// core/History.js — مكدس التراجع والإعادة

const MAX = 50;

export class History {
    constructor(store) {
        this.store   = store;
        this.stack   = [];
        this.pointer = -1;
        this.push();  // initial state
    }

    push() {
        // Discard any redo states above current pointer
        if (this.pointer < this.stack.length - 1) {
            this.stack.splice(this.pointer + 1);
        }
        this.stack.push(this.store.snapshot());
        if (this.stack.length > MAX) this.stack.shift();
        this.pointer = this.stack.length - 1;
    }

    undo() {
        if (!this.canUndo()) return false;
        this.pointer--;
        this.store.restoreSnapshot(JSON.parse(JSON.stringify(this.stack[this.pointer])));
        return true;
    }

    redo() {
        if (!this.canRedo()) return false;
        this.pointer++;
        this.store.restoreSnapshot(JSON.parse(JSON.stringify(this.stack[this.pointer])));
        return true;
    }

    canUndo() { return this.pointer > 0; }
    canRedo() { return this.pointer < this.stack.length - 1; }
}
