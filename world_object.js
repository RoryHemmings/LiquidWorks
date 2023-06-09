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

    isLineIntersectingRectangularPrism(point1, point2) {            //CURRENTLY DOES NOT WORK WITH ROTATION KIND OF
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

    isLineIntersectingSphere(point1, point2) {
        let center = this.position;
        let matrix = this.transform;

        let scaleX =  matrix[0][0];
        let scaleY = matrix[1][1];
        let scaleZ = matrix[2][2];

        const dx = point2[0] - point1[0];
        const dy = point2[1] - point1[1];
        const dz = point2[2] - point1[2];
      
        const scaledDx = dx * scaleX;
        const scaledDy = dy * scaleY;
        const scaledDz = dz * scaleZ;
      
        const a = (scaledDx ** 2) + (scaledDy ** 2) + (scaledDz ** 2);
        const b = 2 * (
          ((point1[0] - center[0]) * scaledDx) +
          ((point1[1] - center[1]) * scaledDy) +
          ((point1[2] - center[2]) * scaledDz)
        );
        const c = (
          ((point1[0] - center[0]) ** 2) +
          ((point1[1] - center[1]) ** 2) +
          ((point1[2] - center[2]) ** 2)
        ) - 1;
      
        const discriminant = b * b - 4 * a * c;
      
        return discriminant >= 0;
    }

    isLineIntersectingTorus(point1, point2) {
        let center = this.position;
        let matrix = this.transform;

        let scaleX =  matrix[0][0];
        let scaleY = matrix[1][1];
        let scaleZ = matrix[2][2];

        const majorRadius = Math.max(scaleX, scaleY, scaleZ);
        const minorRadius = Math.min(scaleX, scaleY, scaleZ) / 2;

        const dx = point2[0] - point1[0];
        const dy = point2[1] - point1[1];
        const dz = point2[2] - point1[2];
      
        const a = (dx ** 2) + (dy ** 2) + (dz ** 2);
        const b = 2 * (
          ((point1[0] - center[0]) * dx) +
          ((point1[1] - center[1]) * dy) +
          ((point1[2] - center[2]) * dz)
        );
        const c =
          ((point1[0] - center[0]) ** 2) +
          ((point1[1] - center[1]) ** 2) +
          ((point1[2] - center[2]) ** 2) -
          (majorRadius ** 2) -
          (minorRadius ** 2);
      
        const discriminant = b * b - 4 * a * c;
      
        if (discriminant < 0) {
          return false; // No intersection with the torus surface
        }
      
        // Calculate the z-coordinate of the intersection point
        const t = (-b - Math.sqrt(discriminant)) / (2 * a);
        const intersectionZ = point1[2] + t * dz;
      
        const holeRadius = minorRadius * .55 ; // Adjust the hole radius as needed
      
        // Calculate the distance of the intersection point from the center in the xy-plane
        const intersectionDistance = Math.sqrt((point1[0] + t * dx - center[0]) ** 2 + (point1[1] + t * dy - center[1]) ** 2);
      
        if (intersectionDistance < holeRadius && Math.abs(intersectionZ) > minorRadius) {
          return false; // Intersection within the torus hole
        }
      
        return true; // Intersection with the torus surface (outside the hole)
    }

    isLineIntersectingShape(point1, point2){
        //console.log(this._shape.cube);
        console.log(this.transform);
        if (this._shape_string == "cube"){
            return this.isLineIntersectingRectangularPrism(point1, point2);
        }
        else if (this._shape_string == "sphere"){
            return this.isLineIntersectingSphere(point1, point2);
        }
        else if (this._shape_string == "torus"){
            return this.isLineIntersectingTorus(point1, point2);
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