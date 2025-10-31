import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNavigationStore } from '@/stores/navigationStore';

// Terminal Building Component
const Terminal = ({ position, size, color, label, terminal }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  label: string;
  terminal: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectTerminal, selectedTerminal } = useNavigationStore();
  
  const isSelected = selectedTerminal === terminal;
  
  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={size}
        onClick={() => selectTerminal(terminal)}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial 
          color={isSelected ? '#FFD700' : color} 
          transparent 
          opacity={0.8}
        />
      </Box>
      <Text
        position={[0, size[1]/2 + 5, 0]}
        fontSize={4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

// Gate Component
const Gate = ({ location }: { location: any }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectLocation, selectedLocation } = useNavigationStore();
  
  const isSelected = selectedLocation?.id === location.id;
  
  return (
    <group position={location.position}>
      <Sphere
        ref={meshRef}
        args={[2]}
        onClick={() => selectLocation(location)}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial 
          color={isSelected ? '#FF6B6B' : '#4ECDC4'} 
          transparent 
          opacity={0.9}
        />
      </Sphere>
      <Text
        position={[0, 4, 0]}
        fontSize={2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {location.name}
      </Text>
    </group>
  );
};

// Shop/Restaurant Component
const ServicePoint = ({ location }: { location: any }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { selectLocation, selectedLocation } = useNavigationStore();
  
  const isSelected = selectedLocation?.id === location.id;
  
  const getColor = (type: string) => {
    switch (type) {
      case 'shop': return '#9B59B6';
      case 'restaurant': return '#E67E22';
      case 'security': return '#E74C3C';
      case 'baggage': return '#3498DB';
      case 'parking': return '#95A5A6';
      case 'service': return '#2ECC71';
      default: return '#BDC3C7';
    }
  };
  
  return (
    <group position={location.position}>
      <Box
        ref={meshRef}
        args={[3, 3, 3]}
        onClick={() => selectLocation(location)}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial 
          color={isSelected ? '#FFD700' : getColor(location.type)} 
          transparent 
          opacity={0.8}
        />
      </Box>
      <Text
        position={[0, 3, 0]}
        fontSize={1.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={10}
      >
        {location.name}
      </Text>
    </group>
  );
};

// User Position Indicator
const UserIndicator = () => {
  const { userPosition } = useNavigationStore();
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });
  
  if (!userPosition) return null;
  
  return (
    <group position={userPosition.position}>
      <Sphere ref={meshRef} args={[1.5]}>
        <meshStandardMaterial color="#FF1744" emissive="#FF1744" emissiveIntensity={0.5} />
      </Sphere>
      <Text
        position={[0, 3, 0]}
        fontSize={2}
        color="#FF1744"
        anchorX="center"
        anchorY="middle"
      >
        VOUS ÊTES ICI
      </Text>
    </group>
  );
};

// Navigation Path
const NavigationPath = () => {
  const { currentPath } = useNavigationStore();
  
  if (!currentPath) return null;
  
  const points = currentPath.waypoints.map(point => new THREE.Vector3(point[0], point[1] + 1, point[2]));
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.5, 8, false);
  
  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
    </mesh>
  );
};

// Ground Floor
const Ground = () => {
  return (
    <Plane args={[200, 200]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <meshStandardMaterial color="#34495E" />
    </Plane>
  );
};

// Main Airport Scene
const AirportScene = () => {
  const { locations, initializeLocations } = useNavigationStore();
  
  // Initialize locations on mount
  React.useEffect(() => {
    if (locations.length === 0) {
      initializeLocations();
    }
  }, [locations.length, initializeLocations]);
  
  // Filter locations by type
  const gates = useMemo(() => locations.filter(loc => loc.type === 'gate'), [locations]);
  const services = useMemo(() => locations.filter(loc => loc.type !== 'gate'), [locations]);
  
  return (
    <Canvas
      camera={{ position: [0, 80, 80], fov: 60 }}
      style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[50, 100, 50]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 50, 0]} intensity={0.5} />
      
      {/* Ground */}
      <Ground />
      
      {/* Terminal Buildings */}
      <Terminal 
        position={[-40, 8, -20]} 
        size={[30, 16, 20]} 
        color="#6A5ACD" 
        label="TERMINAL A"
        terminal="A"
      />
      <Terminal 
        position={[40, 8, -20]} 
        size={[30, 16, 20]} 
        color="#20B2AA" 
        label="TERMINAL B"
        terminal="B"
      />
      <Terminal 
        position={[0, 8, 40]} 
        size={[25, 16, 25]} 
        color="#FF6347" 
        label="TERMINAL C"
        terminal="C"
      />
      
      {/* Central Hub */}
      <Box args={[40, 4, 40]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#2C3E50" transparent opacity={0.7} />
      </Box>
      <Text
        position={[0, 6, 0]}
        fontSize={5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        CENTRE COMMERCIAL
      </Text>
      
      {/* Gates */}
      {gates.map(gate => (
        <Gate key={gate.id} location={gate} />
      ))}
      
      {/* Service Points */}
      {services.map(service => (
        <ServicePoint key={service.id} location={service} />
      ))}
      
      {/* User Position */}
      <UserIndicator />
      
      {/* Navigation Path */}
      <NavigationPath />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={150}
        minDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
};

export default AirportScene;