import * as THREE from 'three';

export const updateSize = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

export const pointPositions = (distance: number) => {
  let positions = [];
  for (let i = 0; i < 3600; i++) {
    const vertex = new THREE.Vector3();

    const theta = Math.acos(THREE.MathUtils.randFloatSpread(2));
    const phi = THREE.MathUtils.randFloatSpread(360);

    vertex.x = distance * Math.sin(theta) * Math.cos(phi);
    vertex.y = distance * Math.sin(theta) * Math.sin(phi);
    vertex.z = distance * Math.cos(theta);
    positions.push(vertex.x, vertex.y, vertex.z);
  }
  return positions;
};
