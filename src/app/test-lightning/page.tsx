"use client";

import { useEffect, useState } from "react";

export default function TestLightning() {
  const [lightningPath, setLightningPath] = useState("");

  useEffect(() => {
    // Generate a realistic jagged lightning path with multiple branches
    const generateLightningPath = (): string => {
      const segments = 15 + Math.floor(Math.random() * 10); // 15-25 segments

      // Start with a sharp point at the top
      const startX = 50;
      const tipOffset = (Math.random() - 0.5) * 4;
      let path = `M ${startX + tipOffset} -2 L ${startX} 0`;

      let currentX = 50;
      let currentY = 0;
      const mainPath: Array<{x: number, y: number}> = [{x: startX, y: 0}];

      // Generate main lightning bolt path
      for (let i = 0; i < segments; i++) {
        // More chaotic horizontal deviation
        const deltaX = (Math.random() - 0.5) * 50;
        const microJagX = (Math.random() - 0.5) * 12;
        currentX += deltaX + microJagX;
        currentX = Math.max(10, Math.min(90, currentX));

        // Variable downward movement
        currentY += (100 / segments) * (0.8 + Math.random() * 0.4);

        path += ` L ${currentX} ${currentY}`;
        mainPath.push({x: currentX, y: currentY});

        // Add multiple branches with varying probabilities
        if (Math.random() > 0.5 && i > 2 && i < segments - 2) {
          // Main branch
          const branchLength = 15 + Math.random() * 25;
          const branchAngle = (Math.random() - 0.5) * 120; // -60 to +60 degrees
          const branchSegments = 3 + Math.floor(Math.random() * 4);

          let branchX = currentX;
          let branchY = currentY;

          path += ` M ${currentX} ${currentY}`;

          for (let j = 0; j < branchSegments; j++) {
            const angleRad = (branchAngle + (Math.random() - 0.5) * 40) * Math.PI / 180;
            const segmentLength = branchLength / branchSegments;

            branchX += Math.sin(angleRad) * segmentLength + (Math.random() - 0.5) * 8;
            branchY += Math.cos(angleRad) * segmentLength + Math.random() * 5;

            path += ` L ${branchX} ${branchY}`;

            // Sub-branches (branches off branches)
            if (Math.random() > 0.6 && j > 0) {
              const subBranchLength = 8 + Math.random() * 12;
              const subBranchAngle = angleRad + (Math.random() - 0.5) * 90 * Math.PI / 180;
              const subBranchSegments = 2 + Math.floor(Math.random() * 2);

              let subX = branchX;
              let subY = branchY;
              path += ` M ${branchX} ${branchY}`;

              for (let k = 0; k < subBranchSegments; k++) {
                subX += Math.sin(subBranchAngle) * (subBranchLength / subBranchSegments);
                subY += Math.cos(subBranchAngle) * (subBranchLength / subBranchSegments) + Math.random() * 3;
                path += ` L ${subX} ${subY}`;
              }

              path += ` M ${branchX} ${branchY}`;
            }
          }

          path += ` M ${currentX} ${currentY}`;
        }
      }

      // End with a sharp point
      const endTipOffset = (Math.random() - 0.5) * 4;
      path += ` L ${currentX + endTipOffset} 102`;

      return path;
    };

    setLightningPath(generateLightningPath());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="relative w-96 h-screen">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{
            filter: `drop-shadow(0 0 20px rgba(34, 211, 238, 1)) drop-shadow(0 0 35px rgba(34, 211, 238, 1))`,
          }}
        >
          {/* Outer glow - thin */}
          <path
            d={lightningPath}
            stroke="rgba(34, 211, 238, 1)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeMiterlimit="10"
            opacity="0.4"
          />
          {/* Inner glow - thinner */}
          <path
            d={lightningPath}
            stroke="rgba(34, 211, 238, 1)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeMiterlimit="10"
            opacity="0.7"
          />
          {/* Main lightning bolt - thin and sharp */}
          <path
            d={lightningPath}
            stroke="rgba(255, 255, 255, 1)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeMiterlimit="10"
          />
          {/* Bright thin core */}
          <path
            d={lightningPath}
            stroke="rgba(255, 255, 255, 1)"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="butt"
            strokeLinejoin="miter"
            strokeMiterlimit="10"
          />
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 text-white">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-cyan-500 rounded hover:bg-cyan-600"
        >
          Generate New Lightning
        </button>
      </div>
    </div>
  );
}
