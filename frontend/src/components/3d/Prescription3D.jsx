import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Prescription3D({ size = 180, isScanning = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const docGroup = new THREE.Group();
    scene.add(docGroup);

    // Document Card (Translucent glass sheet)
    const cardGeo = new THREE.BoxGeometry(1.5, 2.0, 0.05);
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0x0f223f,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
      emissive: 0x051326
    });
    const card = new THREE.Mesh(cardGeo, cardMat);
    docGroup.add(card);

    // Glowing border outline
    const edgesGeo = new THREE.EdgesGeometry(cardGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f2fe });
    const wireframe = new THREE.LineSegments(edgesGeo, lineMat);
    docGroup.add(wireframe);

    // Medical Rx symbol / Text lines
    const lineGroup = new THREE.Group();
    const lineBarMat = new THREE.MeshBasicMaterial({ color: 0x00c9a7, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 4; i++) {
      const lineBar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.02), lineBarMat);
      lineBar.position.set(0, 0.4 - i * 0.28, 0.04);
      lineGroup.add(lineBar);
    }
    docGroup.add(lineGroup);

    // Laser Scan Beam
    const laserGeo = new THREE.BoxGeometry(1.6, 0.04, 0.08);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    laser.position.set(0, 0.8, 0.05);
    docGroup.add(laser);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f2fe, 3, 20);
    pointLight.position.set(2, 3, 3);
    scene.add(pointLight);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const time = clock.getElapsedTime();
        docGroup.rotation.y = Math.sin(time * 0.8) * 0.25;
        docGroup.rotation.x = Math.cos(time * 0.6) * 0.15;
        docGroup.position.y = Math.sin(time * 1.5) * 0.08;

        // Laser beam sweep
        laser.position.y = Math.sin(time * (isScanning ? 5 : 2)) * 0.85;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      cardGeo.dispose();
      cardMat.dispose();
      edgesGeo.dispose();
      lineMat.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      lineBarMat.dispose();
    };
  }, [size, isScanning]);

  return (
    <div
      ref={mountRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
}
