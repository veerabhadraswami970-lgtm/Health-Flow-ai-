import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MedicalCross3D({ size = 180 }) {
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

    const crossGroup = new THREE.Group();
    scene.add(crossGroup);

    // 3D Cross geometry
    const crossMat = new THREE.MeshStandardMaterial({
      color: 0x00c9a7,
      emissive: 0x004d40,
      roughness: 0.15,
      metalness: 0.6,
      transparent: true,
      opacity: 0.95
    });

    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.4), crossMat);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.4), crossMat);
    crossGroup.add(crossV);
    crossGroup.add(crossH);

    // Glowing Core
    const coreGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const core = new THREE.Mesh(coreGeo, coreMat);
    crossGroup.add(core);

    // Orbit ring
    const ringGeo = new THREE.TorusGeometry(1.2, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    crossGroup.add(ring);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00c9a7, 3, 20);
    pointLight.position.set(2, 3, 3);
    scene.add(pointLight);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const time = clock.getElapsedTime();
        crossGroup.rotation.y = time * 0.6;
        crossGroup.rotation.x = Math.sin(time * 0.5) * 0.2;
        crossGroup.position.y = Math.sin(time * 1.5) * 0.08;
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
      crossV.geometry.dispose();
      crossH.geometry.dispose();
      crossMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
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
