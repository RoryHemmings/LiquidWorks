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

        this.colliders = [
            //{intersect_test: WorldObject.intersect_sphere, points: new defs.Subdivision_Sphere(1), leeway: .5},
            //{intersect_test: WorldObject.intersect_sphere, points: new defs.Subdivision_Sphere(2), leeway: .3},
            {intersect_test: WorldObject.intersect_cube, points: new defs.Cube(), leeway: .1}
        ];

        this.collider_selection = 0;

        this.worldObjects = [ new WorldObject(this.shapes.cube, Mat4.identity(), this.materials.phong), ];
        this.selectedObject = this.worldObjects[0];
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
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
        
        console.log(pos_world_near);
       // console.log(pos_world_far);

       const collider = this.colliders[this.collider_selection];

        // for (let obj of this.worldObjects) {
        //     // Pass the two bodies and the collision shape to check_if_colliding():
        //     let b = pos_ndc_near;
        //     if (!obj.check_if_colliding(b, collider))
        //         continue;
        //     // If we get here, we collided, so turn red and zero out the
        //     // velocity so they don't inter-penetrate any further.

        // }

        //console.log(pos_world_far);
        //
        //Do whatever you want
        // let animation_bullet = {
        //     from: center_world_near,
        //     to: pos_world_far,
        //     start_time: program_state.animation_time,
        //     end_time: program_state.animation_time + 5000,
        // }

        // this.animation_queue.push(animation_bullet)
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
        
        const {points, leeway} = this.colliders[this.collider_selection];
        
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