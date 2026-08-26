import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HealthFlowAIOrb({ size = 320, interactive = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Core Sphere (Icosahedron wireframe + inner glowing sphere)
    const coreGeometry = new THREE.IcosahedronGeometry(1.3, 3);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x00c9a7,
      emissive: 0x004d40,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreSphere);

    // Inner Glowing Core
    const innerGeometry = new THREE.SphereGeometry(0.85, 32, 32);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.35,
      wireframe: false
    });
    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerSphere);

    // Orbiting Ring 1 (Cyan)
    const ring1Geometry = new THREE.TorusGeometry(1.85, 0.02, 16, 100);
    const ring1Material = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.8
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    // Orbiting Ring 2 (Indigo)
    const ring2Geometry = new THREE.TorusGeometry(2.1, 0.015, 16, 100);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.6
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    scene.add(ring2);

    // Orbiting Data Nodes (Tiny glowing spheres)
    const nodeCount = 5;
    const nodes = [];
    const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00f2fe });

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      scene.add(node);
      nodes.push({
        mesh: node,
        speed: 0.015 + i * 0.005,
        radius: 1.85 + (i % 2) * 0.25,
        offset: (i * (Math.PI * 2)) / nodeCount
      });
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f2fe, 3, 50);
    pointLight.position.set(3, 4, 3);
    scene.add(pointLight);

    const tealLight = new THREE.PointLight(0x00c9a7, 2, 50);
    tealLight.position.set(-3, -3, 2);
    scene.add(tealLight);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.4;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const elapsedTime = clock.getElapsedTime();

        // Slow calm rotation
        coreSphere.rotation.y += 0.005;
        coreSphere.rotation.x += 0.002;
        ring1.rotation.z += 0.008;
        ring2.rotation.z -= 0.006;

        // Biometric Heartbeat Pulse
        const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.04;
        innerSphere.scale.set(pulse, pulse, pulse);

        // Orbit nodes
        nodes.forEach((item) => {
          const angle = elapsedTime * item.speed * 10 + item.offset;
          item.mesh.position.x = Math.cos(angle) * item.radius;
          item.mesh.position.y = Math.sin(angle) * Math.cos(angle) * 0.8;
          item.mesh.position.z = Math.sin(angle) * item.radius;
        });

        // Parallax easing
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;
        scene.rotation.y = mouseX;
        scene.rotation.x = -mouseY;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      ring1Geometry.dispose();
      ring1Material.dispose();
      ring2Geometry.dispose();
      ring2Material.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
    };
  }, [size, interactive]);

  return (
    <div
      ref={mountRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto'
      }}
    />
  );
}
