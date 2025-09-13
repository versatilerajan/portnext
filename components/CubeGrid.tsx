'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

interface CubeUserData {
  originalY: number;
  originalColor: THREE.Color;
  hoverColor: THREE.Color;
  animationOffset: number;
  isHovered: boolean;
  velocity: THREE.Vector3;
}

export default function CubeGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.7,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x4040ff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ccff, 0.8);
    directionalLight.position.set(15, 15, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xff0077, 2, 50);
    pointLight1.position.set(-15, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffcc, 2, 50);
    pointLight2.position.set(15, 10, -10);
    scene.add(pointLight2);

    // Create cubes
    const cubes: THREE.Mesh[] = [];
    const gridSize = 12;
    const spacing = 3;
    const startPos = -(gridSize - 1) * spacing / 2;

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x1a1a3a),
          emissive: new THREE.Color(0x00ccff),
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2,
          transparent: true,
          opacity: 0.85,
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(
          startPos + x * spacing,
          0,
          startPos + z * spacing
        );
        cube.castShadow = true;
        cube.receiveShadow = true;

        const userData: CubeUserData = {
          originalY: cube.position.y,
          originalColor: new THREE.Color(0x1a1a3a),
          hoverColor: new THREE.Color(0x00ffcc),
          animationOffset: (x + z) * 0.15,
          isHovered: false,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            0,
            (Math.random() - 0.5) * 0.02
          ),
        };

        cube.userData = userData;
        cubes.push(cube);
        scene.add(cube);
      }
    }

    // Particle system for futuristic effect
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      const color = new THREE.Color(0x00ccff).lerp(new THREE.Color(0xff0077), Math.random());
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };

    // Raycaster for hover effects
    const raycaster = new THREE.Raycaster();

    // Event listeners
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleCanvasMouseMove = (event: MouseEvent) => {
      if (!renderer.domElement) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(cubes);

      cubes.forEach(cube => {
        (cube.userData as CubeUserData).isHovered = false;
      });

      if (intersects.length > 0) {
        (intersects[0].object.userData as CubeUserData).isHovered = true;
      }
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mousemove', handleCanvasMouseMove);
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      const time = Date.now() * 0.001;

      // Update mouse-based rotation
      targetRotation.x = mouse.y * 0.2;
      targetRotation.y = mouse.x * 0.2;
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;

      // Animate cubes
      cubes.forEach((cube) => {
        const userData = cube.userData as CubeUserData;

        // Floating and slight drifting
        const floatY = Math.sin(time + userData.animationOffset) * 0.5;
        cube.position.y = userData.originalY + floatY;
        cube.position.x += userData.velocity.x;
        cube.position.z += userData.velocity.z;

        // Boundary checking
        if (Math.abs(cube.position.x) > 20) userData.velocity.x *= -1;
        if (Math.abs(cube.position.z) > 20) userData.velocity.z *= -1;

        // Subtle rotation
        cube.rotation.x = time * 0.1 + userData.animationOffset;
        cube.rotation.y = time * 0.1 + userData.animationOffset;

        // Hover effects
        const material = cube.material as THREE.MeshStandardMaterial;
        if (userData.isHovered) {
          cube.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
          material.emissive.lerp(userData.hoverColor, 0.1);
          material.emissiveIntensity = Math.min(1.5, material.emissiveIntensity + 0.05);
          material.opacity = Math.min(0.95, material.opacity + 0.05);
        } else {
          cube.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
          material.emissive.lerp(userData.originalColor, 0.05);
          material.emissiveIntensity = Math.max(0.5, material.emissiveIntensity - 0.02);
          material.opacity = Math.max(0.85, material.opacity - 0.02);
        }
      });

      // Animate particles
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(time + i) * 0.02;
        if (positions[i * 3 + 1] > 25) positions[i * 3 + 1] = -25;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      scene.rotation.x = currentRotation.x;
      scene.rotation.y = currentRotation.y;

      composer.render();
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      window.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mousemove', handleCanvasMouseMove);
      window.removeEventListener('resize', handleResize);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      cubes.forEach(cube => {
        cube.geometry.dispose();
        (cube.material as THREE.Material).dispose();
      });
      particleSystem.geometry.dispose();
      (particleSystem.material as THREE.Material).dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      id="canvas-container"
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
}