import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { ERAS, type Era } from "@/lib/eras";

type EraNode = {
  mesh: THREE.Mesh;
  era: Era;
};

export default function Timeline3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const eras = useMemo(() => ERAS, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(0, 0, 60);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xfff2cc, 0.8);
    keyLight.position.set(30, 40, 50);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xd9b56f, 0.8, 200);
    rimLight.position.set(-40, -20, 20);
    scene.add(rimLight);

    // Golden spine
    const spine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 160, 16),
      new THREE.MeshStandardMaterial({ color: new THREE.Color("#D9B56F"), metalness: 0.6, roughness: 0.35 })
    );
    spine.position.set(0, 0, 0);
    scene.add(spine);

    // Create nodes for each era
    const nodes: EraNode[] = [];
    const sphere = new THREE.SphereGeometry(2.2, 32, 32);
    const gold = new THREE.Color("#D9B56F");
    const darkBrown = new THREE.Color("#2C1E1E");

    const spacing = 12;
    const startY = -((eras.length - 1) * spacing) / 2;

    eras.forEach((era, idx) => {
      const material = new THREE.MeshStandardMaterial({ color: gold, emissive: gold.clone().multiplyScalar(0.2), metalness: 0.7, roughness: 0.25 });
      const mesh = new THREE.Mesh(sphere, material);
      mesh.position.set(idx % 2 === 0 ? -8 : 8, startY + idx * spacing, 0);
      mesh.userData = { eraId: era.id };
      scene.add(mesh);

      // connector to the spine
      const conn = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.1, 0.1),
        new THREE.MeshStandardMaterial({ color: gold, metalness: 0.5, roughness: 0.5 })
      );
      const isLeft = idx % 2 === 0;
      conn.position.set(isLeft ? -4 : 4, mesh.position.y, 0);
      conn.scale.x = isLeft ? 1 : -1; // mirror gradient look
      scene.add(conn);

      // subtle halo
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(3.0, 3.8, 64),
        new THREE.MeshBasicMaterial({ color: gold, side: THREE.DoubleSide, transparent: true, opacity: 0.18 })
      );
      halo.position.copy(mesh.position);
      halo.rotation.x = Math.PI / 2;
      scene.add(halo);

      nodes.push({ mesh, era });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hovered: THREE.Object3D | null = null;

    const onPointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes.map((n) => n.mesh));
      if (intersects.length > 0) {
        const picked = intersects[0].object as THREE.Mesh;
        const eraNode = nodes.find((n) => n.mesh === picked);
        if (eraNode) {
          navigate(`/era/${eraNode.era.id}`);
        }
      }
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove, { passive: true });
    renderer.domElement.addEventListener("click", onClick);

    // Scroll / wheel to move camera along the timeline
    let targetY = 0;
    const minY = startY - spacing;
    const maxY = startY + (eras.length - 1) * spacing + spacing;
    const onWheel = (e: WheelEvent) => {
      targetY += e.deltaY * 0.05;
      targetY = Math.max(minY, Math.min(maxY, targetY));
    };
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    // Animation loop
    const clock = new THREE.Clock();
    const tempColor = new THREE.Color();

    const animate = () => {
      const dt = Math.min(0.05, clock.getDelta());

      // Lerp cameraY to targetY
      camera.position.y += (targetY - camera.position.y) * Math.min(1, dt * 4);
      camera.lookAt(0, camera.position.y, 0);

      // Hover highlight and gentle rotation
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodes.map((n) => n.mesh));
      const hit = hits[0]?.object || null;

      if (hovered !== hit) {
        if (hovered && (hovered as THREE.Mesh).material) {
          const mat = (hovered as THREE.Mesh).material as THREE.MeshStandardMaterial;
          mat.emissive = gold.clone().multiplyScalar(0.2);
          (hovered as THREE.Mesh).scale.setScalar(1);
        }
        hovered = hit;
        if (hovered && (hovered as THREE.Mesh).material) {
          const mat = (hovered as THREE.Mesh).material as THREE.MeshStandardMaterial;
          mat.emissive = gold.clone().multiplyScalar(0.5);
          (hovered as THREE.Mesh).scale.setScalar(1.12);
        }
      }

      nodes.forEach(({ mesh }) => {
        mesh.rotation.y += dt * 0.25;
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };

    let raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("wheel", onWheel);
      mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if ((obj as any).geometry) (obj as any).geometry.dispose?.();
        if ((obj as any).material) {
          const mat = (obj as any).material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose?.());
          else mat.dispose?.();
        }
      });
      renderer.dispose();
    };
  }, [eras, navigate]);

  return <div ref={mountRef} className="w-full h-full" />;
}



