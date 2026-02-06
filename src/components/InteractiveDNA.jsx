import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Cylinder, Stars } from '@react-three/drei';
import * as THREE from 'three';

function DNAStrand({ count = 40, radius = 2, height = 15 }) {
    const group = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        group.current.rotation.y = t * 0.2; // Slow auto-rotation
        group.current.position.y = Math.sin(t * 0.5) * 0.5; // Floating effect
    });

    const nucleotides = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const angle = t * Math.PI * 4; // 2 full turns
            const y = (t - 0.5) * height;

            // Helix 1
            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;

            // Helix 2 (opposite)
            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;

            // Colors based on position (Gradient)
            const color1 = new THREE.Color().setHSL(t * 0.5 + 0.5, 0.8, 0.5); // Indigo/Purple
            const color2 = new THREE.Color().setHSL(t * 0.2 + 0.1, 0.8, 0.5); // Green/Cyan

            temp.push({
                pos1: [x1, y, z1],
                pos2: [x2, y, z2],
                color1,
                color2,
                key: i
            });
        }
        return temp;
    }, [count, radius, height]);

    return (
        <group ref={group}>
            {nucleotides.map((n) => (
                <group key={n.key}>
                    {/* Backbone 1 */}
                    <Sphere position={n.pos1} args={[0.3, 16, 16]}>
                        <meshStandardMaterial color={n.color1} emissive={n.color1} emissiveIntensity={0.5} roughness={0.1} />
                    </Sphere>

                    {/* Backbone 2 */}
                    <Sphere position={n.pos2} args={[0.3, 16, 16]}>
                        <meshStandardMaterial color={n.color2} emissive={n.color2} emissiveIntensity={0.5} roughness={0.1} />
                    </Sphere>

                    {/* Connection (Base Pair) */}
                    <Cylinder
                        args={[0.05, 0.05, radius * 2, 8]}
                        position={[0, n.pos1[1], 0]}
                        rotation={[0, (n.key / count) * Math.PI * 4, Math.PI / 2]}
                    >
                        <meshStandardMaterial color="#cbd5e1" opacity={0.3} transparent />
                    </Cylinder>
                </group>
            ))}
        </group>
    );
}

export function InteractiveDNA() {
    return (
        <div className="w-full h-96 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl relative">
            <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1 rounded text-xs text-indigo-300 font-mono pointer-events-none">
                INTERACTIVE SIMULATION :: DRAG TO ROTATE
            </div>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <DNAStrand />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
                <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
            </Canvas>
        </div>
    );
}
