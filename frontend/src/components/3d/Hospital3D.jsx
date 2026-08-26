import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hospital3D({ size = 180 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(3, 3, 4);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const hospitalGroup = new THREE.Group();
    scene.add(hospitalGroup);

    // Main building block
    const mainGeo = new THREE.BoxGeometry(1.2, 1.4, 1.2);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0e1c36,
      roughness: 0.2,
      metalness: 0.5,
      emissive: 0x050c18
    });
    const mainBuilding = new THREE.Mesh(mainGeo, buildingMat);
    mainBuilding.position.y = 0.7;
    hospitalGroup.add(mainBuilding);

    // Side wing
    const wingGeo = new THREE.BoxGeometry(0.8, 0.9, 0.9);
    const wing = new THREE.Mesh(wingGeo, buildingMat);
    wing.position.set(0.9, 0.45, 0);
    hospitalGroup.add(wing);

    // Medical Cross on rooftop
    const crossMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), crossMat);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.12), crossMat);
    crossV.position.set(0, 1.6, 0.61);
    crossH.position.set(0, 1.6, 0.61);
    hospitalGroup.add(crossV);
    hospitalGroup.add(crossH);

    // Glowing Helipad / Beacon on roof
    const beaconGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00c9a7 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 1.5, 0);
    hospitalGroup.add(beacon);

    // Glowing base ring
    const baseRingGeo = new THREE.RingGeometry(1.4, 1.5, 32);
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: 0x00c9a7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 0.01;
    hospitalGroup.add(baseRing);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 2);
    dirLight.position.set(4, 6, 4);
    scene.add(dirLight);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const time = clock.getElapsedTime();
        hospitalGroup.rotation.y = time * 0.4;
        hospitalGroup.position.y = Math.sin(time * 1.6) * 0.08;
        const pulse = 1 + Math.sin(time * 4) * 0.3;
        beacon.scale.set(pulse, pulse, pulse);
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
      mainGeo.dispose();
      wingGeo.dispose();
      buildingMat.dispose();
      crossMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      baseRingGeo.dispose();
      baseRingMat.dispose();
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
