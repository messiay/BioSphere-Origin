import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows } from '@react-three/drei';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import { ShieldCheck, Scale, Database, ArrowRight, Activity, Fingerprint } from 'lucide-react';

function AbstractDNA() {
    const group = useRef();
    
    const spheres = useMemo(() => {
        const temp = [];
        const numPairs = 18;
        for (let i = 0; i < numPairs; i++) {
            const y = (i - numPairs / 2) * 0.35;
            const radius = 1.4;
            const angle = i * 0.5;
            
            temp.push({ position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius], scale: 0.18 });
            temp.push({ position: [Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius], scale: 0.18 });
        }
        return temp;
    }, []);

    useFrame((state, delta) => {
        if (group.current) {
            group.current.rotation.y += delta * 0.15;
            group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
        }
    });

    return (
        <group ref={group} position={[0, 0, 0]}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                {spheres.map((props, i) => (
                    <mesh key={i} position={props.position}>
                        <sphereGeometry args={[props.scale, 16, 16]} />
                        <meshPhysicalMaterial 
                            color={i % 2 === 0 ? "#4F46E5" : "#00C7B1"} // Indigo and Emerald
                            transmission={0.9}
                            opacity={1}
                            metalness={0.1}
                            roughness={0.1}
                            ior={1.5}
                            thickness={1.0}
                            clearcoat={1}
                        />
                    </mesh>
                ))}
                {/* Connecting Strands */}
                {Array.from({ length: 18 }).map((_, i) => {
                    const y = (i - 18 / 2) * 0.35;
                    const angle = i * 0.5;
                    return (
                        <mesh key={`conn-${i}`} position={[0, y, 0]} rotation={[0, -angle, Math.PI / 2]}>
                            <cylinderGeometry args={[0.02, 0.02, 2.8, 6]} />
                            <meshStandardMaterial 
                                color="#cbd5e1" 
                                transparent={true}
                                opacity={0.4}
                            />
                        </mesh>
                    );
                })}
            </Float>
        </group>
    );
}

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        className="bench-panel p-8 bg-white border border-slate-200 hover:border-indigo-200 transition-colors group"
    >
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
            <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">{description}</p>
    </motion.div>
);

export function LandingPage({ onProceed }) {
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            
            {/* Header / Nav */}
            <nav className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-8">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded text-white font-black text-sm font-mono tracking-tighter" style={{backgroundColor: 'var(--bio-indigo)'}}>BP</div>
                    <span className="text-sm font-bold tracking-tight leading-none text-slate-800">BioSphere</span>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                </div>
            </nav>

            {/* HERO SECTION */}
            <div className="relative h-screen flex items-center">
                {/* 3D Canvas Background (Right Side) */}
                <div className="absolute inset-y-0 right-0 w-full lg:w-3/5 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-transparent z-10 pointer-events-none" />
                    <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
                        <color attach="background" args={['#f8fafc']} />
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
                        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4F46E5" />
                        <Environment preset="city" />
                        <AbstractDNA />
                        <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                    </Canvas>
                </div>

                {/* Hero Content (Left Side) */}
                <motion.div 
                    style={{ y: yHero, opacity: opacityHero }}
                    className="relative z-20 w-full max-w-7xl mx-auto px-8"
                >
                    <div className="max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                Legal & Biosecurity Infrastructure
                            </div>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                            className="text-5xl lg:text-7xl font-bold tracking-tighter text-slate-900 leading-[1.1] mb-6"
                        >
                            De-risk your <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
                                genetic assets.
                            </span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-sm text-slate-500 leading-relaxed max-w-xl mb-12 font-medium"
                        >
                            Before you file a patent or commercialize a strain, ensure you aren't violating sovereign biopiracy laws or infringing on global IP. The BioSphere engine executes deep-packet forensic analysis on DNA sequences against global regulatory databases in seconds.
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onProceed}
                            className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-[11px] text-white uppercase tracking-[0.2em] bg-slate-900 overflow-hidden rounded shadow-xl"
                        >
                            <span className="absolute inset-0 w-full h-full -mt-1 rounded opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
                            <span className="relative flex items-center gap-3">
                                Initialize Compliance Terminal
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
                
                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Scroll to Explore</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-slate-300 to-transparent"></div>
                </motion.div>
            </div>

            {/* THE THREAT LANDSCAPE */}
            <section id="threats" className="py-32 relative bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">The Biosecurity Threat Landscape</h2>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">Navigating commercial biotechnology requires strict adherence to international sovereignty laws and patent registries. A single violation can result in criminal prosecution or devastating IP litigation.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            delay={0}
                            icon={Scale}
                            title="NBA Sovereignty (Section 6)"
                            description="Commercializing Indian genetic resources without prior approval from the National Biodiversity Authority is a criminal offense under the Biological Diversity Act, 2002. BioSphere intercepts restricted TaxIDs automatically."
                        />
                        <FeatureCard 
                            delay={0.1}
                            icon={Fingerprint}
                            title="Traditional Knowledge (TK)"
                            description="Attempting to patent biological material derived from indigenous traditional medicine (e.g., Neem, Turmeric) violates Section 3(p). Our engine screens against established TK registries."
                        />
                        <FeatureCard 
                            delay={0.2}
                            icon={Database}
                            title="Freedom to Operate (FTO)"
                            description="Avoid costly IP litigation. BioSphere cross-references your sequence against WIPO and USPTO databases to detect active patent infringement (>95% identity) before you commercialize."
                        />
                    </div>
                </div>
            </section>

            {/* THE ENGINE SPECS */}
            <section id="compliance" className="py-32 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                
                <div className="max-w-7xl mx-auto px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <motion.h2 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl font-bold tracking-tight mb-6"
                            >
                                Forensic Cryptographic Proof.
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-sm text-slate-400 leading-relaxed font-medium mb-8"
                            >
                                BioSphere doesn't just scan your sequences—it creates an immutable record of your due diligence. Every analysis generates a secure SHA-256 cryptographic hash of your FASTA data, timestamped and stamped directly onto your compliant PDF report.
                            </motion.p>
                            
                            <motion.ul 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="space-y-4 text-sm font-mono text-slate-300"
                            >
                                <li className="flex items-center gap-3"><Activity className="w-4 h-4 text-indigo-400" /> Parallel NCBI BLAST architecture</li>
                                <li className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-emerald-400" /> WIPO ST.26 Compliant XML Generation</li>
                                <li className="flex items-center gap-3"><Database className="w-4 h-4 text-blue-400" /> Nature vs. Lab synthetic screening</li>
                            </motion.ul>
                        </div>
                        
                        {/* Terminal Mockup */}
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl"
                        >
                            <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center px-4 gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                <span className="ml-2 text-[9px] font-mono text-slate-500 tracking-widest uppercase">biosphere-engine</span>
                            </div>
                            <div className="p-6 font-mono text-xs text-slate-300 leading-loose">
                                <span className="text-emerald-400">$</span> init compliance_protocol<br/>
                                <span className="text-slate-400">[sys]</span> Running Sovereignty Dragnet (Layers 1 & 2)...<br/>
                                <span className="text-indigo-400">[info]</span> Cross-referencing local registry...<br/>
                                <span className="text-amber-400">[warn]</span> Executing NCBI metadata probe...<br/>
                                <span className="text-emerald-400">[ok]</span> Sequence cleared for public domain use.<br/>
                                <br/>
                                <span className="text-emerald-400">$</span> generate_hash --target report.pdf<br/>
                                <span className="text-slate-500">SHA-256: 8f434346648...902</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FOOTER CTA */}
            <section className="py-24 bg-white border-t border-slate-200 text-center relative z-20">
                <div className="max-w-2xl mx-auto px-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Ready to verify your sequence?</h2>
                    <button
                        onClick={onProceed}
                        className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-[11px] text-white uppercase tracking-[0.2em] bg-indigo-600 overflow-hidden rounded shadow-xl hover:bg-indigo-700 transition-colors"
                    >
                        <span className="relative flex items-center gap-3">
                            Proceed to Compliance Terminal
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                    <p className="mt-6 text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Secure · Client-Side Execution · No Data Retention</p>
                </div>
            </section>
            
        </div>
    );
}
