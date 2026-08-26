import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Medicine3D({ size = 180, colorTop = 0x00f2fe, colorBottom = 0xff4b63 }) {
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

    // Group for entire capsule
    const capsuleGroup = new THREE.Group();
    capsuleGroup.rotation.z = Math.PI / 4;
    capsuleGroup.rotation.x = 0.3;
    scene.add(capsuleGroup);

    // Top half (Hemisphere / cylinder)
    const topCapGeometry = new THREE.CylinderGeometry(0.65, 0.65, 0.7, 32);
    const topSphereGeometry = new THREE.SphereGeometry(0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    
    const topMat = new THREE.MeshStandardMaterial({
      color: colorTop,
      roughness: 0.15,
      metalness: 0.6,
      emissive: 0x003344,
      transparent: true,
      opacity: 0.95
    });

    const topCylinder = new THREE.Mesh(topCapGeometry, topMat);
    topCylinder.position.y = 0.35;
    capsuleGroup.add(topCylinder);

    const topSphere = new THREE.Mesh(topSphereGeometry, topMat);
    topSphere.position.y = 0.7;
    capsuleGroup.add(topSphere);

    // Bottom half
    const bottomMat = new THREE.MeshStandardMaterial({
      color: colorBottom,
      roughness: 0.15,
      metalness: 0.6,
      emissive: 0x330011,
      transparent: true,
      opacity: 0.95
    });

    const bottomCylinder = new THREE.Mesh(topCapGeometry, bottomMat);
    bottomCylinder.position.y = -0.35;
    capsuleGroup.add(bottomCylinder);

    const bottomSphere = new THREE.Mesh(topSphereGeometry, bottomMat);
    bottomSphere.rotation.x = Math.PI;
    bottomSphere.position.y = -0.7;
    capsuleGroup.add(bottomSphere);

    // Mid ring
    const midRingGeo = new THREE.TorusGeometry(0.67, 0.03, 16, 32);
    const midRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const midRing = new THREE.Mesh(midRingGeo, midRingMat);
    midRing.rotation.x = Math.PI / 2;
    capsuleGroup.add(midRing);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x00f2fe, 3, 20);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const time = clock.getElapsedTime();
        capsuleGroup.rotation.y = time * 0.8;
        capsuleGroup.position.y = Math.sin(time * 1.5) * 0.12;
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
      topCapGeometry.dispose();
      topSphereGeometry.dispose();
      topMat.dispose();
      bottomMat.dispose();
      midRingGeo.dispose();
      midRingMat.dispose();
    };
  }, [size, colorTop, colorBottom]);

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
