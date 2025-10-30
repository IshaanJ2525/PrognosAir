/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect } from 'react';

const AircraftModelViewer = ({ onPartClick }) => {
  const modelRef = useRef();

  const partData = {
    "Fuselage": {
      name: "Fuselage",
      usedHours: 3920,
      totalHours: 4000,
      condition: "Attention Required",
      lastCheck: "2025-06",
      nextService: "80h remaining",
    },
    "Wing": {
        name: "Wing",
        usedHours: 1500,
        totalHours: 5000,
        condition: "Good",
        lastCheck: "2025-08",
        nextService: "3500h remaining",
      },
    "Engine": {
        name: "Engine",
        usedHours: 2500,
        totalHours: 3000,
        condition: "Good",
        lastCheck: "2025-07",
        nextService: "500h remaining",
      },
    "Tail": {
        name: "Tail",
        usedHours: 500,
        totalHours: 6000,
        condition: "Good",
        lastCheck: "2025-09",
        nextService: "5500h remaining",
      },
  };

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
            onPartClick(partData["Fuselage"]);
          }
        } else {
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
        style={{ width: '100%', height: '100%', cursor: 'default' }}
        ></model-viewer>
    </div>
  );
};

export default AircraftModelViewer;