import { defs, tiny } from './lib/common.js';
import { WorldObject } from './world_object.js'

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
    Canvas_Widget
} = tiny;

const { Torus, Subdivision_Sphere, Cube, Phong_Shader, Textured_Phong } = defs

/* Base Scene */
class Editor extends Scene {
    constructor() {
        super();

        this.shapes = {
            cube: new Cube(),
            sphere: new Subdivision_Sphere(4),
            torus: new Torus(30, 30),
        }

        this.materials = {
            phong: new Material(new Phong_Shader(), {
                ambient: 0.5,
                diffusivity: 1.0,
                specularity: 1.0,
                color: hex_color("#ffffff"),
            }),
            gouraud: new Material(new  Gouraud_Shader(),
                {ambient: 0, diffusivity: .5, color: hex_color("#000000"), specularity: 1
            }),
        }

        this.worldObjects = [ new WorldObject(this.shapes.cube, Mat4.identity(), this.materials.phong, "cube")];
        this.worldObjects[0].translate_transform(500,500,500);
        this.selectedObject = this.worldObjects[0];
        this.selected = false;
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.mode = "select";
        this.initialPos = [0, 0, 0];

    }

    set_mode(mode) {
        this.mode = mode;
    }


    my_mouse_down_select(e, pos, context, program_state) {
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


        let intersectedObjects = [];
        let closestObject = null;
        let closestDistance = Infinity;

        for (let obj of this.worldObjects) {
            if (obj.isLineIntersectingShape(pos_world_near, pos_world_far)) {
                intersectedObjects.push(obj);
                
                const distance = obj.calculateDistance(pos_world_near);
                
                if (distance < closestDistance) {
                    closestObject = obj;
                    closestDistance = distance;
                }
            }
        }

        if (intersectedObjects.length > 0) {
            if (this.selectedObject == closestObject){
                this.selectedObject = undefined;
                this.selected = false;
            }
            else{
                this.selectedObject = closestObject;
                this.selected = true;
            }
        } 
        else {
            this.selectedObject = undefined;
            this.selected = false;
        }

    }

    my_mouse_down_translate(e, pos, context, program_state, initial) {
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

        if (initial){
            this.initialPos = pos_world_near;
        }
        else {
            const diffX = pos_world_near[0] - this.initialPos[0];
            const diffY = pos_world_near[1] - this.initialPos[1];
            const diffZ = pos_world_near[2] - this.initialPos[2];


            this.selectedObject.translate_transform(diffX*10, diffY*10, diffZ*10);

            this.initialPos = pos_world_near;
        }
    }

    my_mouse_down_rotate(e, pos, context, program_state, initial) {
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

        if (initial){
            this.initialPos = pos_world_near;
        }
        else {
            const diffX = pos_world_near[0] - this.initialPos[0];
            const diffY = pos_world_near[1] - this.initialPos[1];
            const diffZ = pos_world_near[2] - this.initialPos[2];

            const angleX = Math.atan2(diffY, diffZ);
            const angleY = Math.atan2(diffX, diffZ);
            const angleZ = Math.atan2(diffX, diffY);


            this.selectedObject.rotate_transform(angleX/180, 0, 0, 1);          //THIS MAKES NO SENSE :(((((((
            this.selectedObject.rotate_transform(angleY/180, 0, 1, 0);
            this.selectedObject.rotate_transform(angleZ/180, 1, 0, 0);

            this.initialPos = pos_world_near;
        }
    }


    my_mouse_down_scale(e, pos, context, program_state, initial) {
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

        if (initial){
            this.initialPos = pos_world_near;
        }
        else {
            const diffX = pos_world_near[0] - this.initialPos[0];
            const diffY = pos_world_near[1] - this.initialPos[1];
            const diffZ = pos_world_near[2] - this.initialPos[2];

            //console.log();
            this.selectedObject.scale_transform(1 + diffX*2, 1 + diffY*2, 1 + diffZ*2);

            this.initialPos = pos_world_near;
        }
    }

    
    display(context, program_state) {
        let isMouseDown = false;
        //let initialPos;

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
                isMouseDown = true;

                const rect = canvas.getBoundingClientRect();

                if (this.mode == "Select"){
                    this.my_mouse_down_select(e, mouse_position(e), context, program_state);
                }
                else if (this.mode == "Transform"){
                    e.stopImmediatePropagation();
                    this.my_mouse_down_translate(e, mouse_position(e), context, program_state, true);
                }
                else if (this.mode == "Rotate"){
                    e.stopImmediatePropagation();
                    this.my_mouse_down_rotate(e, mouse_position(e), context, program_state, true);
                }
                else if (this.mode == "Scale"){
                    e.stopImmediatePropagation();
                    this.my_mouse_down_scale(e, mouse_position(e), context, program_state, true);
                }
            });

            canvas.addEventListener("mousemove", e => {
                e.preventDefault();

                if (isMouseDown){
                    if (this.mode == "Transform"){
                        e.stopImmediatePropagation();
                        controls.enablePan = false;
                        var mouseX = e.clientX;
                        var mouseY = e.clientY;

                        this.my_mouse_down_translate(e, mouse_position(e), context, program_state, false);
                    }
                    else if (this.mode == "Rotate"){
                        e.stopImmediatePropagation();
                        controls.enablePan = false;

                        this.my_mouse_down_rotate(e, mouse_position(e), context, program_state, false);
                    }
                    if (this.mode == "Scale"){
                        e.stopImmediatePropagation();
                        controls.enablePan = false;
                        var mouseX = e.clientX;
                        var mouseY = e.clientY;

                        this.my_mouse_down_scale(e, mouse_position(e), context, program_state, false);
                    }
                }
            });

            canvas.addEventListener("mouseup", e => {
                 e.preventDefault();
                 isMouseDown = false;

            });
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        
        
        for (let obj of this.worldObjects) {
            if (obj == this.selectedObject) {
                obj.drawSelected(context, program_state);
            }
            else{
                obj.draw(context, program_state);
            }
        }
    }
}

class Gouraud_Shader extends Shader {

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 vertex_color;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

                vertex_color = vec4(shape_color.xyz * ambient, shape_color.w);
                vertex_color.xyz += phong_model_lights(N, vertex_worldspace);
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                gl_FragColor = vertex_color;
                return;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

export {Editor, Canvas_Widget}