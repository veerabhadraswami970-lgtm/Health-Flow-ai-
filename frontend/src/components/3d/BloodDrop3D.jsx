import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BloodDrop3D({ size = 180 }) {
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

    const dropGroup = new THREE.Group();
    scene.add(dropGroup);

    // Tear drop / Blood drop geometry using lathe or sphere + cone
    const bottomSphereGeo = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const topConeGeo = new THREE.ConeGeometry(0.7, 0.9, 32);

    const dropMat = new THREE.MeshStandardMaterial({
      color: 0xff3b56,
      roughness: 0.1,
      metalness: 0.3,
      emissive: 0x440011,
      transparent: true,
      opacity: 0.92
    });

    const bottomSphere = new THREE.Mesh(bottomSphereGeo, dropMat);
    bottomSphere.rotation.x = Math.PI;
    bottomSphere.position.y = -0.15;
    dropGroup.add(bottomSphere);

    const topCone = new THREE.Mesh(topConeGeo, dropMat);
    topCone.position.y = 0.3;
    dropGroup.add(topCone);

    // Inner subtle glow core
    const innerGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xff8da1, transparent: true, opacity: 0.6 });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    innerCore.position.y = -0.1;
    dropGroup.add(innerCore);

    // Subtle fluid pulse rings
    const ringGeo = new THREE.TorusGeometry(0.9, 0.015, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4b63, transparent: true, opacity: 0.4 });
    const pulseRing = new THREE.Mesh(ringGeo, ringMat);
    pulseRing.rotation.x = Math.PI / 2;
    dropGroup.add(pulseRing);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff4b63, 3, 20);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const time = clock.getElapsedTime();
        dropGroup.rotation.y = time * 0.7;
        dropGroup.position.y = Math.sin(time * 1.8) * 0.1;

        const pulse = 1 + Math.sin(time * 2.5) * 0.05;
        dropGroup.scale.set(pulse, pulse, pulse);

        const ringPulse = 1 + Math.sin(time * 2) * 0.15;
        pulseRing.scale.set(ringPulse, ringPulse, ringPulse);
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
      bottomSphereGeo.dispose();
      topConeGeo.dispose();
      dropMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, [size]);

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
