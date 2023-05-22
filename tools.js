class Tool {
    constructor(ui, displayName) {
        this._ui = ui;
        this._displayName = displayName;

        this._element = this._createElement();
    }

    select() {
        // TODO tell controller to select this as current selected tool
        // controller will then display current metrics/settings - defined in metrics and settings array
        // and event handler for clicking on screen
        this._ui.selectTool(this);
    }

    getElement() {
        return this._element;
    }

    _createElement() {
        let div = document.createElement('div');
        div.className = 'tool';

        let button = document.createElement('button');
        button.innerHTML = this._displayName;
        button.addEventListener('click', () => this.select());

        div.appendChild(button);
        return div;
    }
}

export class SelectTool extends Tool {
    constructor(ui) {
        super(ui, 'Select');
    }
}

export class TransformTool extends Tool {
    constructor(ui) {
        super(ui, 'Transform');
    }
}

export class RotateTool extends Tool {
    constructor(ui) {
        super(ui, 'Rotate');
    }
}

export class ScaleTool extends Tool {
    constructor(ui) {
        super(ui, 'Scale');
    }
}