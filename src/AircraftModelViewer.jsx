/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Overlay from './Overlay';

const AircraftModelViewer = ({ theme, modelName }) => {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const modelRef = useRef();
  const [selectedPart, setSelectedPart] = useState(null);
  const [partData, setPartData] = useState({});



  useEffect(() => {
    const loadModelData = async () => {
      try {
        const module = await import(`./partData_${modelName}.js`);
        setPartData(module.partData);
      } catch (error) {
        console.error("Error loading part data:", error);
        setPartData({});
      }
    };

    if (modelName) {
      loadModelData();
    }
  }, [modelName]);

  useEffect(() => {
    const showOverlay = (name) => {
      const part = partData[name];
      setSelectedPart(part);
    };
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? '#020617' : '#d4d4d8');
    scene.fog = new THREE.Fog(theme === 'dark' ? '#020617' : '#d4d4d8', 100, 300);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-35, 15, 30);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controlsRef.current = controls;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, theme === 'dark' ? 1.0 : 1.5);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, theme === 'dark' ? 0.8 : 1.0);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(theme === 'dark' ? 0x404040 : 0x666666, theme === 'dark' ? 0.6 : 0.8);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, theme === 'dark' ? 0.8 : 1.0, 500, Math.PI / 4, 0.5, 2);
    spotLight.position.set(50, 60, 50);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshPhongMaterial({ color: theme === 'dark' ? 0x020617 : 0xd4d4d8, depthWrite: false })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const loader = new GLTFLoader();
    loader.load(`${process.env.PUBLIC_URL}/models/${modelName}.glb`, (gltf) => {
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      const partNames = new Set();
      model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.name) {
            partNames.add(node.name);
          }
          if (node.material.map) {
            node.material.map.encoding = THREE.sRGBEncoding;
            node.material.map.anisotropy = 16;
          }
          node.material.needsUpdate = true;
        }
      });
      console.log('Part names from GLB model:', Array.from(partNames));
      scene.add(model);
      modelRef.current = model;


    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (modelRef.current) {
        const intersects = raycaster.intersectObjects(modelRef.current.children, true);
        if (intersects.length > 0) {
          const part = intersects[0].object.name;
          console.log('Clicked part:', part);
          showOverlay(part);
        }
      }
    };

    canvas.addEventListener('click', handleClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      renderer.dispose();
      controls.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, modelName, partData]);

  return (
    <>
      <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh', display: 'block' }} />
      {selectedPart && <Overlay part={selectedPart} onClose={() => setSelectedPart(null)} theme={theme} />}
      <div id="bottomBar">
        <div>PrognosAir © 2025</div>
        <div>Status: Operational</div>
      </div>
    </>
  );
};

export default AircraftModelViewer;