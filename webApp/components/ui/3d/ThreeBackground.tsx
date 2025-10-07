import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        // Scene & camera
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0f172a, 0.15); // deep teal fog

        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0); // transparent background
        container.appendChild(renderer.domElement);

        // Geometry & materials
        const coreGeo = new THREE.IcosahedronGeometry(2, 2);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x064e3b,
            emissiveIntensity: 0.8,
            roughness: 0.4,
            metalness: 0.3,
            transparent: true,
            opacity: 0.8,
            flatShading: true,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);

        const wireGeo = new THREE.IcosahedronGeometry(2.1, 2);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x34d399,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
        });
        const wire = new THREE.Mesh(wireGeo, wireMat);
        scene.add(wire);

        // Floating particle glow layer
        const particleCount = 1500;
        const particlesGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++)
            positions[i] = (Math.random() - 0.5) * 15;
        particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const particlesMat = new THREE.PointsMaterial({
            color: 0x6ee7b7,
            size: 0.04,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const particles = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particles);

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        const keyLight = new THREE.DirectionalLight(0x10b981, 1);
        keyLight.position.set(5, 5, 5);
        const rimLight = new THREE.DirectionalLight(0x14b8a6, 0.4);
        rimLight.position.set(-5, -5, -5);
        scene.add(ambient, keyLight, rimLight);

        // Interaction variables
        let mouseX = 0,
            mouseY = 0,
            targetX = 0,
            targetY = 0,
            scrollY = 0;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / container.clientWidth) * 2 - 1;
            mouseY = -(e.clientY / container.clientHeight) * 2 + 1;
        };
        const onScroll = () => (scrollY = window.scrollY);

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("scroll", onScroll, { passive: true });

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            // Smooth interpolation
            targetX += (mouseX * 0.3 - targetX) * 0.05;
            targetY += (mouseY * 0.3 - targetY) * 0.05;

            core.rotation.x += 0.004 + targetY * 0.02;
            core.rotation.y += 0.004 + targetX * 0.02;
            wire.rotation.copy(core.rotation);
            wire.rotation.z += 0.001;

            // Subtle scroll scale + camera drift
            const scrollScale = 1 + scrollY * 0.0005;
            core.scale.set(scrollScale, scrollScale, scrollScale);
            wire.scale.set(scrollScale, scrollScale, scrollScale);
            camera.position.z = 5 + scrollY * 0.002;

            particles.rotation.y += 0.0008;
            particles.rotation.x += 0.0003;

            renderer.render(scene, camera);
        };
        animate();

        // Resize
        const handleResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        // Cleanup
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("scroll", onScroll);
            resizeObserver.disconnect();
            container.removeChild(renderer.domElement);
            renderer.dispose();
            coreGeo.dispose();
            coreMat.dispose();
            wireGeo.dispose();
            wireMat.dispose();
            particlesGeo.dispose();
            particlesMat.dispose();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
