import { createButton, createDiv, createFileInput, createInput } from './dom.js';
import { WorldObject } from './world_object.js';

import { defs, tiny } from './lib/common.js';
import { ShapeFromFile } from './utils.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
    Canvas_Widget
} = tiny;

const { Torus, Subdivision_Sphere, Cube, Phong_Shader, Textured_Phong } = defs

class Tool {
    constructor(ui, displayName) {
        this._ui = ui;
        this._displayName = displayName;
        this._element = this._createElement();
        this._controls = [];
    }

    // Update selection status
    touch(selected) {
        this._element.querySelector('button').style =
            `background-color: ${selected ? '#303030' : '#606060'}`;
    }

    getElement() {
        return this._element;
    }

    getControls() {
        return this._controls;
    }

    _createElement() {
        let div = createDiv('tool');
        let button = document.createElement('button');
        button.innerHTML = this._displayName;
        button.addEventListener("mousedown", e => { 
        this._ui.selectTool(this);
        this._ui.getEditor().set_mode(this._displayName);
        });

        div.appendChild(button);
        return div;
    }
}

export class SelectTool extends Tool {
    constructor(ui) {
        super(ui, 'Select');

        const div = createDiv('control-div');
        const p = document.createElement('p');
        p.innerHTML = 'none';

        div.appendChild(p);
        this._controls = div;
    }

    setSelectedObject(obj) {
        
    }
}

export class TransformTool extends Tool {
    constructor(ui) {
        super(ui, 'Transform');
        this._x = 0;
        this._y = 0;
        this._z = 0;

        let div = createDiv('control-div');
        let c1 = createInput({
            label: 'Delta X:',
            callback: (e) => {
                this._ui.getEditor().selectedObject.translate_transform(e.target.value,0 , 0);
            },
        });
        div.appendChild(c1);
        let c2 = createInput({
            label: 'Delta Y:',
            callback: (e) => {
                this._ui.getEditor().selectedObject.translate_transform(0, e.target.value, 0);
            },
        });
        div.appendChild(c2);

        let c3 = createInput({
            label: 'Delta Z:',
            callback: (e) => {
                this._ui.getEditor().selectedObject.translate_transform(0, 0, e.target.value);
            },
        });
        div.appendChild(c3);

        this._controls = div;
    }

    touch(selected) {
        super.touch(selected);

        this._x = this._ui.getEditor().selectedObject.transform[0][3];
        this._y = this._ui.getEditor().selectedObject.transform[1][3];
        this._z = this._ui.getEditor().selectedObject.transform[2][3];

        this._controls.childNodes[0].childNodes[1].setAttribute('value', this._x);
        this._controls.childNodes[1].childNodes[1].setAttribute('value', this._y);
        this._controls.childNodes[2].childNodes[1].setAttribute('value', this._z);
    }
}

export class RotateTool extends Tool {
    constructor(ui) {
        super(ui, 'Rotate');

        let div = createDiv('control-div');
        let c1 = createInput({
            label: 'Rotate X (Degrees):',
            callback: (e) => {
                this._ui.getEditor().selectedObject.rotate_transform(e.target.value/90, 1, 0, 0);
            },
        });
        div.appendChild(c1);

        let c2 = createInput({
            label: 'Rotate Y (Degrees):',
            callback: (e) => {
                this._ui.getEditor().selectedObject.rotate_transform(e.target.value/90, 0, 1, 0);
            },
        });
        div.appendChild(c2);

        let c3 = createInput({
            label: 'Rotate Z (Degrees):',
            callback: (e) => {
                this._ui.getEditor().selectedObject.rotate_transform(e.target.value/90, 0, 0, 1);
            },
        });
        div.appendChild(c3);

        this._controls = div;
    }
}

export class ScaleTool extends Tool {
    constructor(ui) {
        super(ui, 'Scale');

        let div = createDiv('control-div');
        let c1 = createInput({
            label: 'ScaleX:',
            callback: (e) => {
                if (e.target.value > 0){
                this._ui.getEditor().selectedObject.scale_transform(e.target.value, 1, 1);
                }
            },
        });
        div.appendChild(c1);

        let c2 = createInput({
            label: 'ScaleY:',
            callback: (e) => {
                if (e.target.value > 0){
                this._ui.getEditor().selectedObject.scale_transform(1, e.target.value, 1);
                }
            },
        });
        div.appendChild(c2);

        let c3 = createInput({
            label: 'ScaleZ:',
            callback: (e) => {
                if (e.target.value > 0){
                this._ui.getEditor().selectedObject.scale_transform(1, 1, e.target.value);
                }
            },
        });
        div.appendChild(c3);

        this._controls = div;
    }
}



export class ColorTool extends Tool {
    constructor(ui) {
        super(ui, 'Color/Texture');

        let div = createDiv('control-div');
        let c = document.createElement('input');
        c.type = 'color';
        c.addEventListener('change', (e) => {
            this._ui.getEditor().selectedObject.change_color(e.target.value);
        });
        div.appendChild(c);

        div.appendChild(
            createButton({
                label: "Phong Shader",                    
                className: 'phong-color-button',
                callback: () => this._ui.getEditor().selectedObject.change_shader(this._ui.getEditor().materials.phong),
            })
        );

        div.appendChild(
            createButton({
                label: "Gouraud Shader",                    
                className: 'gouraud-color-button',
                callback: () => this._ui.getEditor().selectedObject.change_shader(this._ui.getEditor().materials.gouraud),
            })
        );

        // Import
        div.appendChild(
            createFileInput({
                label: 'Import',                    
                className: 'add-world-object-button',
                callback: (e) => this.importMaterial(e),
            })
        );

        this._controls = div;
    }

    addMaterial(path) {
        const mat =  new Material(new Textured_Phong(), {
            color: hex_color("#000000"),
            ambient: 1,
            texture: new Texture(path, "LINEAR_MIPMAP_LINEAR")
        });

        this._ui.getEditor().selectedObject.change_shader(mat);
        this._ui.getEditor().selectedObject.change_color("000000");
    }

    async importMaterial(e) {
        let filepath = '';
        try { filepath = await this._chooseFile(e); }
        catch (err) { return; }

        this.addMaterial(filepath);
    }

    _chooseFile(e) {
        return new Promise((resolve, reject) => {
            const file = e.target.files[0];
            if (file === undefined) reject();

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const content = e.target.result; 
                const link = document.createElement('a');
                link.href = content;
                resolve(link);
            };
        });
    }
}

export class AddTool extends Tool {
    constructor(ui) {
        super(ui, 'Add');

        this.variance = 5;

        let div = createDiv('control-div');

        // Prebuild Objects
        const options = ui.getEditor().shapes;
        for (const obj in options) {
            div.appendChild(
                createButton({
                    label: obj,                    
                    className: 'add-world-object-button',
                    callback: () => this.addObject(options[obj], obj),
                })
            );
        }

        // Import
        div.appendChild(
            createFileInput({
                label: 'Import',                    
                className: 'add-world-object-button',
                callback: (e) => this.importObject(e),
            })
        );

        this._controls = div;
    }

    addObject(obj, label="custom") {
        const options = this._ui.getEditor().shapes;
        const materials = this._ui.getEditor().materials;

        const random_offset = Mat4.translation(
            Math.random()*this.variance - this.variance/2,
            Math.random()*this.variance - this.variance/2,
            0,
        );

        const wo = new WorldObject(obj, random_offset, materials.phong, label);
        this._ui.getEditor().worldObjects.push(wo);
    }

    async importObject(e) {
        let filepath = '';
        try { filepath = await this._chooseFile(e); }
        catch (err) { return; }

        this.addObject(new ShapeFromFile(filepath));
    }

    _chooseFile(e) {
        return new Promise((resolve, reject) => {
            const file = e.target.files[0];
            if (file === undefined) reject();

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const content = e.target.result; 
                const link = document.createElement('a');
                link.href = content;
                resolve(link);
            };
        });
    }
}