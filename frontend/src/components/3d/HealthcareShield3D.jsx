import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HealthcareShield3D({ size = 180 }) {
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

    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    // Shield Shape (Extruded custom shape)
    const shape = new THREE.Shape();
    shape.moveTo(-0.7, 0.8);
    shape.lineTo(0.7, 0.8);
    shape.quadraticCurveTo(0.8, -0.1, 0, -1.0);
    shape.quadraticCurveTo(-0.8, -0.1, -0.7, 0.8);

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0f2942,
      emissive: 0x031826,
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity: 0.9
    });

    const shieldMesh = new THREE.Mesh(geometry, material);
    shieldMesh.position.z = -0.075;
    shieldGroup.add(shieldMesh);

    // Glowing Cross or Check in the center
    const checkMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.08), checkMat);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.08), checkMat);
    crossV.position.set(0, 0, 0.1);
    crossH.position.set(0, 0, 0.1);
    shieldGroup.add(crossV);
    shieldGroup.add(crossH);

    // Ambient and Point lights
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
        shieldGroup.rotation.y = Math.sin(time * 0.9) * 0.35;
        shieldGroup.position.y = Math.sin(time * 1.5) * 0.08;
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
      geometry.dispose();
      material.dispose();
      checkMat.dispose();
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
