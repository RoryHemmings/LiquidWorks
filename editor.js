import { defs, tiny } from './lib/common.js';
import { WorldObject } from './world_object.js'

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
    Canvas_Widget
} = tiny;

const { Cube, Phong_Shader } = defs

/* Base Scene */
class Editor extends Scene {
    constructor() {
        super();

        this.shapes = {
            cube: new Cube(),
        }

        this.materials = {
            phong: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 1.0,
                specularity: 1.0,
                color: hex_color("#ffffff"),
            }),
        }


        this.worldObjects = [ new WorldObject(this.shapes.cube, Mat4.identity(), this.materials.phong), new WorldObject(this.shapes.cube, Mat4.identity(), this.materials.phong), ];
        this.worldObjects[0].translate_transform(500,500,500);
        this.selectedObject = this.worldObjects[0];
        this.selected = false;
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }


    my_mouse_down(e, pos, context, program_state) {
        let pos_ndc_near = vec4(pos[0], pos[1], -1.0, 1.0);
        let pos_ndc_far  = vec4(pos[0], pos[1],  1.0, 1.0);
        let center_ndc_near = vec4(0.0, 0.0, -1.0, 1.0);
        let P = program_state.projection_transform;
        let V = program_state.camera_inverse;
        let pos_world_near = Mat4.inverse(P.times(V)).times(pos_ndc_near);
        let pos_world_far  = Mat4.inverse(P.times(V)).times(pos_ndc_far);
        let center_world_near  = Mat4.inverse(P.times(V)).times(center_ndc_near);
        pos_world_near.scale_by(1 / pos_world_near[3]);
        pos_world_far.scale_by(1 / pos_world_far[3]);
        center_world_near.scale_by(1 / center_world_near[3]);

       let found = false;

         for (let obj of this.worldObjects) {
             if (obj.isLineIntersectingRectangularPrism(pos_world_near, pos_world_far)) {
                found = true;
                if (this.selectedObject == this.worldObjects[0]){
                    this.selectedObject = obj;
                    this.selected = true;
                }
                else {
                    this.selected = false;
                }
             }
         }
         if ((!this.selected) || (!found)){
            this.selectedObject = this.worldObjects[0];
         }

    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            let LookAt = Mat4.look_at(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));
            program_state.set_camera(LookAt);

            let canvas = context.canvas;
            const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
                vec((e.clientX - (rect.left + rect.right) / 2) / ((rect.right - rect.left) / 2),
                    (e.clientY - (rect.bottom + rect.top) / 2) / ((rect.top - rect.bottom) / 2));

            canvas.addEventListener("mousedown", e => {
                e.preventDefault();
                const rect = canvas.getBoundingClientRect()
                // console.log("e.clientX: " + e.clientX);
                // console.log("e.clientX - rect.left: " + (e.clientX - rect.left));
                // console.log("e.clientY: " + e.clientY);
                // console.log("e.clientY - rect.top: " + (e.clientY - rect.top));
                // console.log("mouse_position(e): " + mouse_position(e));
                this.my_mouse_down(e, mouse_position(e), context, program_state);
            });
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        
        
        for (let obj of this.worldObjects) {
            if (obj == this.selectedObject){
                obj.drawSelected(context, program_state);
            }
            else{
            obj.draw(context, program_state);
            }
        }
    }
}

export {Editor, Canvas_Widget}