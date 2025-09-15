'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three-stdlib/postprocessing/EffectComposer';
import { RenderPass } from 'three-stdlib/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three-stdlib/postprocessing/UnrealBloomPass';

interface CubeUserData {
  startY: number;
  currentY: number;
  speed: number;
  originalColor: THREE.Color;
  hoverColor: THREE.Color;
  animationOffset: number;
  isHovered: boolean;
  rotationSpeed: THREE.Vector3;
  opacity: number;
  scale: number;
  resetTimer: number;
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
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 30);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.3,
      0.9
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x2040ff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ccff, 0.6);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x8b5cf6, 1.5, 100);
    pointLight1.position.set(-20, 15, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00d4ff, 1.5, 100);
    pointLight2.position.set(20, 15, 0);
    scene.add(pointLight2);

    // Create floating cubes
    const cubes: THREE.Mesh[] = [];
    const cubeCount = 80; // Increased number of cubes
    
    // Create a shared geometry and materials for better performance
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const materials = [
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x8b5cf6),
        emissive: new THREE.Color(0x4c1d95),
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.8,
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x00d4ff),
        emissive: new THREE.Color(0x0ea5e9),
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.8,
      }),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xff0080),
        emissive: new THREE.Color(0x9f1239),
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.8,
      }),
    ];

    for (let i = 0; i < cubeCount; i++) {
      const material = materials[Math.floor(Math.random() * materials.length)].clone();
      const cube = new THREE.Mesh(geometry, material);
      
      // Random starting position
      const startX = (Math.random() - 0.5) * 60;
      const startZ = (Math.random() - 0.5) * 40;
      const startY = -30 - Math.random() * 20; // Start below the viewport
      
      cube.position.set(startX, startY, startZ);
      
      // Random scale
      const scale = 0.5 + Math.random() * 1.5;
      cube.scale.setScalar(scale);

      const userData: CubeUserData = {
        startY: startY,
        currentY: startY,
        speed: 0.02 + Math.random() * 0.04, // Random upward speed
        originalColor: material.color.clone(),
        hoverColor: new THREE.Color().copy(material.color).multiplyScalar(1.5),
        animationOffset: Math.random() * Math.PI * 2,
        isHovered: false,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        opacity: material.opacity,
        scale: scale,
        resetTimer: Math.random() * 1000, // Random reset timing
      };

      cube.userData = userData;
      cubes.push(cube);
      scene.add(cube);
    }

    // Enhanced particle system
    const particleCount = 300;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      
      const colorChoice = Math.random();
      let color;
      if (colorChoice < 0.33) {
        color = new THREE.Color(0x8b5cf6);
      } else if (colorChoice < 0.66) {
        color = new THREE.Color(0x00d4ff);
      } else {
        color = new THREE.Color(0xff0080);
      }
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = Math.random() * 2 + 0.5;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Mouse tracking for camera movement
    const mouse = { x: 0, y: 0 };
    const targetCameraPosition = { x: 0, y: 10, z: 30 };

    // Raycaster for hover effects
    const raycaster = new THREE.Raycaster();

    // Event listeners
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Subtle camera movement based on mouse
      targetCameraPosition.x = mouse.x * 5;
      targetCameraPosition.y = 10 + mouse.y * 3;
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

      // Smooth camera movement
      camera.position.x += (targetCameraPosition.x - camera.position.x) * 0.02;
      camera.position.y += (targetCameraPosition.y - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Animate cubes - floating upward
      cubes.forEach((cube, index) => {
        const userData = cube.userData as CubeUserData;

        // Move cube upward
        userData.currentY += userData.speed;
        cube.position.y = userData.currentY;

        // Add floating motion
        const floatOffset = Math.sin(time + userData.animationOffset) * 0.5;
        const driftOffset = Math.sin(time * 0.3 + userData.animationOffset) * 0.3;
        cube.position.x += driftOffset * 0.01;
        cube.position.y += floatOffset * 0.01;

        // Rotate cube
        cube.rotation.x += userData.rotationSpeed.x;
        cube.rotation.y += userData.rotationSpeed.y;
        cube.rotation.z += userData.rotationSpeed.z;

        // Fade out as it goes higher
        const material = cube.material as THREE.MeshStandardMaterial;
        const fadeStart = 25;
        const fadeEnd = 35;
        
        if (cube.position.y > fadeStart) {
          const fadeProgress = Math.min(1, (cube.position.y - fadeStart) / (fadeEnd - fadeStart));
          material.opacity = userData.opacity * (1 - fadeProgress);
        } else {
          material.opacity = userData.opacity;
        }

        // Reset cube when it goes too high or after timer
        userData.resetTimer += 1;
        if (cube.position.y > 40 || userData.resetTimer > 2000 + Math.random() * 1000) {
          cube.position.x = (Math.random() - 0.5) * 60;
          cube.position.z = (Math.random() - 0.5) * 40;
          userData.currentY = -30 - Math.random() * 20;
          cube.position.y = userData.currentY;
          userData.speed = 0.02 + Math.random() * 0.04;
          userData.resetTimer = 0;
          material.opacity = userData.opacity;
          
          // Randomize scale on reset
          const newScale = 0.5 + Math.random() * 1.5;
          cube.scale.setScalar(newScale);
          userData.scale = newScale;
        }

        // Hover effects
        if (userData.isHovered) {
          cube.scale.lerp(new THREE.Vector3(userData.scale * 1.3, userData.scale * 1.3, userData.scale * 1.3), 0.1);
          material.emissive.lerp(userData.hoverColor, 0.1);
          material.emissiveIntensity = Math.min(0.8, material.emissiveIntensity + 0.05);
        } else {
          cube.scale.lerp(new THREE.Vector3(userData.scale, userData.scale, userData.scale), 0.1);
          material.emissive.lerp(userData.originalColor.clone().multiplyScalar(0.2), 0.05);
          material.emissiveIntensity = Math.max(0.3, material.emissiveIntensity - 0.02);
        }
      });

      // Animate particles - also floating upward
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.02 + Math.sin(time + i) * 0.01; // Upward movement
        positions[i * 3] += Math.sin(time * 0.5 + i) * 0.005; // Subtle horizontal drift
        
        // Reset particle when it goes too high
        if (positions[i * 3 + 1] > 40) {
          positions[i * 3 + 1] = -40;
          positions[i * 3] = (Math.random() - 0.5) * 80;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

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
      geometry.dispose();
      materials.forEach(material => material.dispose());
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
        pointerEvents: 'none',
      }}
    />
  );
}
