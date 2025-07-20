import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
interface LoadingScreenProps {
  isLoading: boolean;
}
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const textGroupRef = useRef<THREE.Group | null>(null);
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 5;
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    // Create a rotating cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      wireframe: false
    });
    const cube = new THREE.Mesh(geometry, material);
    cubeRef.current = cube;
    scene.add(cube);
    // Create text for each face of the cube
    const textGroup = new THREE.Group();
    textGroupRef.current = textGroup;
    scene.add(textGroup);
    // Create a wireframe cube slightly larger than the solid cube
    const wireframeGeometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframeCube = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframeCube);
    // Create animated particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    // Animation loop
    const animate = () => {
      if (!isLoading) return;
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      wireframeCube.rotation.x = cube.rotation.x;
      wireframeCube.rotation.y = cube.rotation.y;
      particlesMesh.rotation.x += 0.002;
      particlesMesh.rotation.y += 0.002;
      renderer.render(scene, camera);
      requestIdRef.current = requestAnimationFrame(animate);
    };
    // Start animation
    animate();
    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);
  // Handle loading state changes
  useEffect(() => {
    if (isLoading && sceneRef.current && cameraRef.current && rendererRef.current) {
      const animate = () => {
        if (!isLoading) return;
        if (cubeRef.current) {
          cubeRef.current.rotation.x += 0.01;
          cubeRef.current.rotation.y += 0.01;
        }
        rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
        requestIdRef.current = requestAnimationFrame(animate);
      };
      requestIdRef.current = requestAnimationFrame(animate);
    } else if (requestIdRef.current) {
      cancelAnimationFrame(requestIdRef.current);
    }
  }, [isLoading]);
  if (!isLoading) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute inset-0" ref={containerRef}></div>
      <div className="absolute text-white text-4xl font-bold tracking-widest z-10 text-center">
        <div className="mb-4">Ra3</div>
        <div className="text-sm font-normal animate-pulse">Loading...</div>
      </div>
    </div>;
};