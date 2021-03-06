import * as THREE from "three";
import C from "cannon";

// CONSTANTS
const fontURL = "./src/fonts/helvetiker_bold.typeface.json";
const margin = 6;
const totalMass = 1;

export default class Menu {
  constructor(scene, world) {
    // DOM elements
    this.$navItems = document.querySelectorAll(".mainNav a");

    // Three components
    this.scene = scene;
    this.world = world;
    this.loader = new THREE.FontLoader();

    // Constants
    this.words = [];
    this.offset = this.$navItems.length * margin * 0.5;

    this.loader.load(fontURL, f => {
      this.setup(f);
    });
  }

  setup(f) {
    const fontOption = {
      font: f,
      size: 3,
      height: 0.4,
      curveSegments: 24,
      bevelEnabled: true,
      bevelThickness: 0.9,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 10
    };

    Array.from(this.$navItems)
      .reverse()
      .forEach(($item, i) => {
        const { innerText } = $item;

        const words = new THREE.Group();
        words.letterOff = 0;

        words.ground = new C.Body({
          mass: 0,
          shape: new C.Box(new C.Vec3(50, 0.1, 50)),
          position: new C.Vec3(0, i * margin - this.offset, 0)
        });

        this.world.addBody(words.ground);

        Array.from(innerText).forEach((letter, j) => {
          const material = new THREE.MeshPhongMaterial({ color: 0x97df5e });
          const geometry = new THREE.TextBufferGeometry(letter, fontOption);

          geometry.computeBoundingBox();
          geometry.computeBoundingSphere();

          const mesh = new THREE.Mesh(geometry, material);
          // Get size
          mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());

          // We'll use this accumulator to get the offset of each letter
          words.letterOff += mesh.size.x;

          // Create the shape of our letter
          // Note that we need to scale down our geometry because of Box'Cannon class setup
          const box = new C.Box(new C.Vec3().copy(mesh.size).scale(0.5));

          // Attach the body directly to the mesh
          mesh.body = new C.Body({
            mass: totalMass / innerText.length,
            position: new C.Vec3(words.letterOff, this.getOffsetY(i), 0)
          });

          // Add the shape to the body and offset it to the center of our mesh
          const { center } = mesh.geometry.boundingSphere;
          mesh.body.addShape(box, new C.Vec3(center.x, center.y, center.z));

          this.world.addBody(mesh.body);
          words.add(mesh);
        });

        // Recenter each body based on the whole string.
        words.children.forEach(letter => {
          letter.body.position.x -= letter.size.x + words.letterOff * 0.5;
        });

        this.words.push(words);
        this.scene.add(words);
      });
  }

  update() {
    if (!this.words) return;

    this.words.forEach((word, j) => {
      for (let i = 0; i < word.children.length; i++) {
        const letter = word.children[i];

        letter.position.copy(letter.body.position);
        letter.quaternion.copy(letter.body.quaternion);
      }
    });
  }

  getOffsetY(i) {
    return (this.$navItems.length - i - 1) * margin - this.offset;
  }
}
