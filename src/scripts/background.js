import * as THREE from 'three';

function getParticleCount() {
    const area = window.innerWidth * window.innerHeight;
    const density = area / 5000;
    return Math.max(40, Math.min(150, Math.round(density)));
}
const PARTICLE_COUNT = getParticleCount()
const CONNECTION_DISTANCE = 150;
const PARTICLE_COLOR = 0x757575;
const SPEED = 0.3;

let scene, camera, renderer, particles, positions, velocities, lineSegments, linePositions, lineColors;
let width = window.innerWidth;
let height = window.innerHeight;

function init() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x111111, 1);

    // Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.z = 500;

    // Particles
    const particleGeo = new THREE.BufferGeometry();
    positions = new Float32Array(PARTICLE_COUNT * 3);
    velocities = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3]         = (Math.random() - 0.5) * width;
        positions[i * 3 + 1] = (Math.random() - 0.5) * height;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

        velocities.push(
            (Math.random() - 0.5) * SPEED,
            (Math.random() - 0.5) * SPEED,
            (Math.random() - 0.5) * SPEED * 0.3
        );
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: PARTICLE_COLOR,
        size: 2.5,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
    });

    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lines (pre-allocate max possible connections)
    const maxLines = PARTICLE_COUNT * (PARTICLE_COUNT - 1) / 2;
    linePositions = new Float32Array(maxLines * 6);
    lineColors         = new Float32Array(maxLines * 6);

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color',        new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    window.addEventListener('resize', onResize);
    animate();
}

function onResize() {
    width    = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    // Re-randomize boundary so particles don't cluster in corners
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3]         = Math.max(-width / 2,    Math.min(width / 2,    positions[i * 3]));
        positions[i * 3 + 1] = Math.max(-height / 2, Math.min(height / 2, positions[i * 3 + 1]));
    }
}

function animate() {
    requestAnimationFrame(animate);

    const halfW = width    / 2;
    const halfH = height / 2;

    // Move particles, bounce off walls
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3, iy = ix + 1, iz = ix + 2;
        const ivx = i * 3, ivy = ivx + 1, ivz = ivx + 2;

        positions[ix] += velocities[ivx];
        positions[iy] += velocities[ivy];
        positions[iz] += velocities[ivz];

        if (positions[ix] >    halfW || positions[ix] < -halfW) velocities[ivx] *= -1;
        if (positions[iy] >    halfH || positions[iy] < -halfH) velocities[ivy] *= -1;
        if (positions[iz] >    150     || positions[iz] < -150)     velocities[ivz] *= -1;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // Build line segments
    let lineIndex = 0;
    const r = 0x75 / 0xFF;
    const g = 0x75 / 0xFF;
    const b = 0x75 / 0xFF;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
            const ax = positions[i * 3], ay = positions[i * 3 + 1], az = positions[i * 3 + 2];
            const bx = positions[j * 3], by = positions[j * 3 + 1], bz = positions[j * 3 + 2];

            const dx = ax - bx, dy = ay - by, dz = az - bz;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < CONNECTION_DISTANCE) {
                const alpha = (1 - dist / CONNECTION_DISTANCE); // 0..1, brighter when closer

                linePositions[lineIndex * 6]         = ax;
                linePositions[lineIndex * 6 + 1] = ay;
                linePositions[lineIndex * 6 + 2] = az;
                linePositions[lineIndex * 6 + 3] = bx;
                linePositions[lineIndex * 6 + 4] = by;
                linePositions[lineIndex * 6 + 5] = bz;

                // Dim color = dark grey, bright color = #F7F7F7 → lerp by alpha
                const dimmed = alpha * r;
                lineColors[lineIndex * 6]         = dimmed;
                lineColors[lineIndex * 6 + 1] = dimmed;
                lineColors[lineIndex * 6 + 2] = dimmed;
                lineColors[lineIndex * 6 + 3] = dimmed;
                lineColors[lineIndex * 6 + 4] = dimmed;
                lineColors[lineIndex * 6 + 5] = dimmed;

                lineIndex++;
            }
        }
    }

    // Tell Three.js how many vertices are actually drawn
    lineSegments.geometry.setDrawRange(0, lineIndex * 2);
    lineSegments.geometry.attributes.position.needsUpdate = true;
    lineSegments.geometry.attributes.color.needsUpdate        = true;

    renderer.render(scene, camera);
}

// Auto-init after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}