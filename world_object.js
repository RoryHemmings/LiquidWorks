import { defs, tiny } from './lib/common.js';


const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const { Cube, Phong_Shader } = defs

export class WorldObject {
    constructor(shape, transform, shader, string) {
        this._shape = shape;
        this._shape_string = string;
        this._transform = transform;
        this._shader = shader;
        this._position = [this.transform[0][3], this.transform[1][3], this.transform[2][3]];
        this._scale = [1, 1, 1];
        this._rotation = [0, 0, 0];
        this._color = hex_color("#FFFFFF");
    }

    // (within some margin of distance).
    static intersect_cube(p, margin = 0) {
        return p.every(value => value >= -1 - margin && value <= 1 + margin)
    }
    
    static intersect_sphere(p, margin = 0) {
        return p.dot(p) < 1 + margin;
    }

    set transform(t) {
        this._transform = t;
    }

    get position() {
        return this._position;
    }

    get scale() {
        return this._scale;
    }

    get rotation() {
        return this._rotation;
    }

    get transform(){
        return this._transform;
    }

    translate_transform(dx, dy, dz){
        this._transform = this._transform.times(Mat4.translation(dx, dy, dz));
        this.position[0] += dx;
        this.position[1] += dy;
        this.position[2] += dz;
    }

    rotate_transform(angle, rx, ry, rz) {
        this._transform = this._transform.times(Mat4.rotation(angle, rx, ry, rz))
        if (rx !== 0)
            this._rotation[0] += angle;
        if (ry !== 0)
            this._rotation[1] += angle;
        if (rz !== 0)
            this._rotation[2] += angle;
    }

    scale_transform(sx, sy, sz) {
        this._transform = this._transform.times(Mat4.scale(sx, sy, sz));

        this._scale[0] *= sx;
        this._scale[1] *= sy;
        this._scale[2] *= sz;
        console.log(this._scale);
    }

    change_color(color){
        this._color = hex_color(color);
    }

    change_shader(shader){
        this._shader = shader;

    }

    isLineIntersectingRectangularPrism(point1, point2) {
        let prismCenter = this.position;
        let matrix = this.transform;


        let scaleX =  matrix[0][0];
        let scaleY = matrix[1][1];
        let scaleZ = matrix[2][2];

        const min_x = prismCenter[0] - scaleX ;
        const max_x = prismCenter[0] + scaleX ;
        const min_y = prismCenter[1] - scaleY ;
        const max_y = prismCenter[1] + scaleY ;
        const min_z = prismCenter[2] - scaleZ ;
        const max_z = prismCenter[2] + scaleZ ;

        const direction = [
          point2[0] - point1[0],
          point2[1] - point1[1],
          point2[2] - point1[2]
        ];

        const distance = Math.sqrt(
          direction[0] * direction[0] +
          direction[1] * direction[1] +
          direction[2] * direction[2]
        );

        const normalizedDirection = [
          direction[0] / distance,
          direction[1] / distance,
          direction[2] / distance
        ];

        const tValues = [
          (min_x - point1[0]) / normalizedDirection[0],
          (max_x - point1[0]) / normalizedDirection[0],
          (min_y - point1[1]) / normalizedDirection[1],
          (max_y - point1[1]) / normalizedDirection[1],
          (min_z - point1[2]) / normalizedDirection[2],
          (max_z - point1[2]) / normalizedDirection[2]
        ];

        const tMin = Math.max(
          Math.min(tValues[0], tValues[1]),
          Math.min(tValues[2], tValues[3]),
          Math.min(tValues[4], tValues[5])
        );

        const tMax = Math.min(
          Math.max(tValues[0], tValues[1]),
          Math.max(tValues[2], tValues[3]),
          Math.max(tValues[4], tValues[5])
        );

        if (tMin <= tMax && tMax >= 0 && tMin <= distance) {
          return true;
        } else {
          return false;
        }
      }
      


    isLineIntersectingSphere(point1, point2) {
        let center = this.position;
        let matrix = this.transform;
      
        let scaleX = matrix[0][0];
        let scaleY = matrix[1][1];
        let scaleZ = matrix[2][2];
      
        const dx = point2[0] - point1[0];
        const dy = point2[1] - point1[1];
        const dz = point2[2] - point1[2];
      
        const scaledDx = dx / scaleX;
        const scaledDy = dy / scaleY;
        const scaledDz = dz / scaleZ;
      
        const a = (scaledDx ** 2) + (scaledDy ** 2) + (scaledDz ** 2);
        const b = 2 * (
          ((point1[0] - center[0]) / scaleX) * scaledDx +
          ((point1[1] - center[1]) / scaleY) * scaledDy +
          ((point1[2] - center[2]) / scaleZ) * scaledDz
        );
        const c = (
          ((point1[0] - center[0]) / scaleX) ** 2 +
          ((point1[1] - center[1]) / scaleY) ** 2 +
          ((point1[2] - center[2]) / scaleZ) ** 2
        ) - 1;
      
        const discriminant = b * b - 4 * a * c;
      
        return discriminant >= 0;
      
    }

    isLineIntersectingTorus(point1, point2) {
        let prismCenter = this.position;
        let matrix = this.transform;

        let prismSides =  [2 * matrix[0][0], 2 * matrix[1][1], 2 * matrix[2][2]];

        const halfSides = prismSides.map(side => side / 2);

        const prismMin = prismCenter.map((center, index) => center - halfSides[index]);
        const prismMax = prismCenter.map((center, index) => center + halfSides[index]);

        for (let i = 0; i < 3; i++) {
            if (point1[i] < prismMin[i] && point2[i] < prismMin[i]) {
            continue;
            }
            if (point1[i] > prismMax[i] && point2[i] > prismMax[i]) {
            continue;
            }

            const t = (prismMax[i] - point1[i]) / (point2[i] - point1[i]);
            const intersection = point1.map((coord, index) => coord + t * (point2[index] - coord));

            let isInside = true;
            for (let j = 0; j < 3; j++) {
            if (j === i) {
                continue;
            }
            if (intersection[j] < prismMin[j] || intersection[j] > prismMax[j]) {
                isInside = false;
                break;
            }
            }
            if (isInside) {
            return true; 
            }
        }

        return false; 
    }

    isLineIntersectingShape(point1, point2){
        if (this._shape_string == "cube"){
            return this.isLineIntersectingRectangularPrism(point1, point2);
        }
        else if (this._shape_string == "sphere"){
            return this.isLineIntersectingSphere(point1, point2);
        }
        else if (this._shape_string == "torus"){
            return this.isLineIntersectingTorus(point1, point2);
        }
        else if (this._shape_string == "custom"){
            return this.isLineIntersectingRectangularPrism(point1, point2);
        }
        
    }

    calculateDistance(point) {
        let center = this.position
        const dx = point[0] - center[0];
        const dy = point[1] - center[1];
        const dz = point[2] - center[2];
      
        const distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
        return distance;
      }

    draw(context, program_state) {
        this._shape.draw(context, program_state, this._transform, this._shader.override({color: this._color}));
    }

    drawSelected(context, program_state) {
        const green = hex_color("#00FF00");
        const gray = hex_color("#FFFFFF");
        this._shape.draw(context, program_state, this._transform, this._shader.override({color: green}));
    }
}