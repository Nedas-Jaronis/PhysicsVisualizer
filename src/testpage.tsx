import React, { useEffect, useRef } from 'react';
import { MatterManager } from './matter';

const AirFriction: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const matterRef = useRef<MatterManager | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      matterRef.current = new MatterManager(containerRef.current);
    }

    return () => {
      matterRef.current?.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '800px',
        height: '600px',
        border: '1px solid black', // optional, helps visualize container
      }}
    />
  );
};

export default AirFriction;
