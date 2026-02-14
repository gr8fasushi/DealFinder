"use client";

import { useEffect, useState } from "react";

interface Lightning {
  id: number;
  path: string;
  x: number;
  glow: string;
}

export function LightningStrikes() {
  const [lightnings, setLightnings] = useState<Lightning[]>([]);

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

  useEffect(() => {
    const triggerLightning = () => {
      const id = Date.now();
      const x = 10 + Math.random() * 80; // Random position (10% to 90% across)
      const path = generateLightningPath();

      // Randomize glow color (bright cyan or blue)
      const glowColor = Math.random() > 0.5
        ? "rgba(34, 211, 238, 1)" // bright cyan
        : "rgba(96, 165, 250, 1)"; // bright blue

      setLightnings((prev) => [...prev, { id, path, x, glow: glowColor }]);

      // Remove after animation completes (1300ms)
      setTimeout(() => {
        setLightnings((prev) => prev.filter((l) => l.id !== id));
      }, 1300);
    };

    // Initial trigger after 0.2 seconds
    const initialTimeout = setTimeout(triggerLightning, 200);

    // Then trigger every 0.3-1 seconds (extremely frequent!)
    const interval = setInterval(() => {
      // Randomly trigger 1-3 lightning strikes at once
      const count = Math.random() > 0.6 ? (Math.random() > 0.7 ? 3 : 2) : 1;
      for (let i = 0; i < count; i++) {
        // Small delay between simultaneous strikes for effect
        setTimeout(() => triggerLightning(), i * 100);
      }
    }, 300 + Math.random() * 700);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {lightnings.map((lightning) => (
        <div
          key={lightning.id}
          className="absolute inset-0 pointer-events-none"
          style={{
            left: `${lightning.x}%`,
            transform: "translateX(-50%)",
            animation: "lightning-flash 1.3s ease-out",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-40 h-full"
            style={{
              filter: `drop-shadow(0 0 20px ${lightning.glow}) drop-shadow(0 0 35px ${lightning.glow})`,
            }}
          >
            {/* Outer glow - thin */}
            <path
              d={lightning.path}
              stroke={lightning.glow}
              strokeWidth="4"
              fill="none"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
              opacity="0.4"
            />
            {/* Inner glow - thinner */}
            <path
              d={lightning.path}
              stroke={lightning.glow}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
              opacity="0.7"
            />
            {/* Main lightning bolt - thin and sharp */}
            <path
              d={lightning.path}
              stroke="rgba(255, 255, 255, 1)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
            />
            {/* Bright thin core */}
            <path
              d={lightning.path}
              stroke="rgba(255, 255, 255, 1)"
              strokeWidth="0.5"
              fill="none"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeMiterlimit="10"
            />
          </svg>
        </div>
      ))}
    </>
  );
}
