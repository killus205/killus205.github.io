import { Mesh, MeshNormalMaterial, Group, MeshPhongMaterial, MeshToonMaterial } from "../lib/build/three.module.js";
import { Cube } from "./blocks/Cube.js";
import { face_offsets } from "./blocks/cube_consts.js";

import { scene, stone } from "./setting.js";

class Chunk {
    constructor(){
        this.width = 16
        this.height = 64
        this.blocks = new Uint8Array(this.width * this.width * this.height)
        this.group = new Group()
        scene.add(this.group)
    }

    getIndex(x, y, z){
        return (this.inChunk(x,y,z)) ? z+y*this.height+x*this.width*this.width : null
    }

    getPosition(idx){
        let x, y, z
        z = idx
        idx = idx >> 4
        z -= idx << 4

        y = idx
        idx = idx >> 4
        y -= idx << 4

        x = idx
        idx = idx >> 4
        x -= idx << 4
        return [x, y, z]
    }

    inChunk(...pos){
        let b = true
        for (let x of pos){
            b = b & ( x>=0 && x<=15 )
        } 
        return b
    }

    getFaces(x,y,z){
        let faces = [],
            ox, oy, oz

        console.group(`Checking faces for: ${x} ${y} ${z}`)
        for (let [i, v] of face_offsets.entries()){
            ox = x + v[0]
            oy = y + v[1]
            oz = z + v[2]

            let blockIndex = this.getIndex(ox, oy, oz)
            console.log(`index of block at ${ox} ${oy} ${oz}: ${blockIndex}`)

            if (blockIndex){
                if (!this.blocks[blockIndex]) faces.push(i)
                //else if (this.outOfChunk(ox, oy, oz)) faces.push(i)
            }
            
        }
        console.groupEnd()
        
        return faces
    }

    setBlock(x, y, z, block_id){
        let index = this.getIndex(x, y, z),
            ox, oy, oz

        this.blocks[index] = block_id
        this.createMesh(x,y,z)

        console.group(`Checking blocks around: ${x} ${y} ${z}:`)
        for (let offsets of face_offsets){
            ox = x + offsets[0]
            oy = y + offsets[1]
            oz = z + offsets[2]

            let blockIndex = this.getIndex(ox, oy, oz)
            if (blockIndex == null) continue
            if (this.blocks[blockIndex] == 0) continue

            console.log(this.blocks[blockIndex])
            this.updateMesh(ox,oy,oz)
        }
        console.groupEnd()
    }

    createMesh(x, y, z){
        let index = this.getIndex(x,y,z)

        let option = { map: stone, color: 0x999999 }
        //option = { wireframe: true }

        let material = new MeshToonMaterial(option),
            mesh = new Mesh(new Cube(this.getFaces(x,y,z)), material)

        mesh.position.set(x,y,z)
        mesh.name = `${index}`
        this.group.add(mesh)
    }

    updateMesh(x, y, z){
        let index = this.getIndex(x,y,z)
        let mesh = this.group.getObjectByName(`${index}`)

        mesh.geometry = new Cube(this.getFaces(x,y,z))
        mesh.updateMatrix()
    }
}

export default Chunk 