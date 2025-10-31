/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect } from 'react';
import { partAliases } from './partAliases';

const AircraftModelViewer = ({ onPartClick }) => {
  const modelRef = useRef();

  const partData = Object.keys(partAliases).reduce((acc, partName) => {
    const usedHours = Math.floor(Math.random() * 4000);
    const totalHours = 4000;
    const condition = usedHours > 3800 ? "Attention Required" : "Good";
    acc[partName] = {
      name: partName,
      usedHours,
      totalHours,
      condition,
      lastCheck: `2025-0${Math.floor(Math.random() * 9) + 1}`,
      nextService: `${totalHours - usedHours}h remaining`,
    };
    return acc;
  }, {});

  useEffect(() => {
    const modelViewer = modelRef.current;

    const handleClick = (event) => {
        const material = modelViewer.materialFromPoint(event.clientX, event.clientY);
        if (material) {
          console.log("Clicked part material name:", material.name);
          const partName = material.name;
          if (partData[partName]) {
            onPartClick(partData[partName]);
          } else {
            // Fallback to a default part if the clicked part is not in partData
            onPartClick(partData["Fuselage"]);
          }
        } else {
            // Fallback to a default part if no material is found
            onPartClick(partData["Fuselage"]);
        }
      };

    modelViewer.addEventListener('click', handleClick);

    return () => {
      modelViewer.removeEventListener('click', handleClick);
    };
  }, [onPartClick, partData]);

  return (
    <div className="w-full h-full">
        <model-viewer
        ref={modelRef}
        src={`${process.env.PUBLIC_URL}/models/787-9_9V-SCA.glb`}
        alt="Boeing 787"
        camera-controls
        interpolation-decay={120}
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
        ></model-viewer>
    </div>
  );
};

export default AircraftModelViewer;