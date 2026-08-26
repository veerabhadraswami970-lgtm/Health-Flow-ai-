import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function AccidentEmergency3D({ size = 260 }) {
  const mountRef = useRef(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let scene, camera, renderer, animationFrameId, clock;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(3.5, 3.2, 4.5);
      camera.lookAt(0, 0.5, 0);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const mainGroup = new THREE.Group();
      scene.add(mainGroup);

      // Hospital Building Structure
      const buildingGeo = new THREE.BoxGeometry(1.4, 1.6, 1.4);
      const buildingMat = new THREE.MeshStandardMaterial({
        color: 0x121c2d,
        roughness: 0.3,
        metalness: 0.6,
        emissive: 0x07111e
      });
      const mainBuilding = new THREE.Mesh(buildingGeo, buildingMat);
      mainBuilding.position.y = 0.8;
      mainGroup.add(mainBuilding);

      // Red Medical Cross on roof façade
      const crossMat = new THREE.MeshBasicMaterial({ color: 0xff3b5c });
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), crossMat);
      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.14), crossMat);
      crossV.position.set(0, 1.8, 0.71);
      crossH.position.set(0, 1.8, 0.71);
      mainGroup.add(crossV);
      mainGroup.add(crossH);

      // Emergency Pulsing Siren Light on Helipad
      const sirenGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const sirenMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
      const sirenBeacon = new THREE.Mesh(sirenGeo, sirenMat);
      sirenBeacon.position.set(0, 1.7, 0);
      mainGroup.add(sirenBeacon);

      // Outer Emergency Radar Pulse Ring
      const pulseRingGeo = new THREE.RingGeometry(1.6, 1.8, 48);
      const pulseRingMat = new THREE.MeshBasicMaterial({
        color: 0xff3b5c,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
      pulseRing.rotation.x = Math.PI / 2;
      pulseRing.position.y = 0.02;
      mainGroup.add(pulseRing);

      // Secondary Inner Cyan Pulse Ring
      const innerRingGeo = new THREE.RingGeometry(1.1, 1.25, 48);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRing.rotation.x = Math.PI / 2;
      innerRing.position.y = 0.03;
      mainGroup.add(innerRing);

      // Vertical Emergency Connection Light Beam
      const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 16);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xff3b5c, transparent: true, opacity: 0.45 });
      const connectionBeam = new THREE.Mesh(beamGeo, beamMat);
      connectionBeam.position.set(0, 1.75, 0);
      mainGroup.add(connectionBeam);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const redAlertLight = new THREE.PointLight(0xff0044, 3, 10);
      redAlertLight.position.set(0, 2.5, 0);
      scene.add(redAlertLight);

      const cyanDirLight = new THREE.DirectionalLight(0x00f2fe, 1.5);
      cyanDirLight.position.set(3, 5, 3);
      scene.add(cyanDirLight);

      clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        if (!prefersReducedMotion) {
          const time = clock.getElapsedTime();
          mainGroup.rotation.y = time * 0.45;
          mainGroup.position.y = Math.sin(time * 2) * 0.06;

          // Pulse animation
          const pulseScale = 1 + Math.sin(time * 6) * 0.25;
          pulseRing.scale.set(pulseScale, pulseScale, pulseScale);
          pulseRingMat.opacity = 0.8 - Math.sin(time * 6) * 0.3;

          const sirenScale = 1 + Math.sin(time * 8) * 0.4;
          sirenBeacon.scale.set(sirenScale, sirenScale, sirenScale);
          redAlertLight.intensity = 2.5 + Math.sin(time * 8) * 1.5;
        }

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (container && renderer && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
        if (renderer) renderer.dispose();
        buildingGeo.dispose();
        buildingMat.dispose();
        crossMat.dispose();
        sirenGeo.dispose();
        sirenMat.dispose();
        pulseRingGeo.dispose();
        pulseRingMat.dispose();
        innerRingGeo.dispose();
        innerRingMat.dispose();
        beamGeo.dispose();
        beamMat.dispose();
      };
    } catch (err) {
      console.warn("WebGL initialization failed, rendering 2D fallback:", err);
      setWebglFailed(true);
    }
  }, [size]);

  if (webglFailed) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 59, 92, 0.08)',
        border: '1px solid rgba(255, 59, 92, 0.3)',
        borderRadius: '50%',
        position: 'relative'
      }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ff3b5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
        <span style={{ fontSize: '0.72rem', color: '#ff7b8d', fontWeight: 800, marginTop: '8px' }}>
          3D Emergency Hub (2D Mode)
        </span>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    />
  );
}
