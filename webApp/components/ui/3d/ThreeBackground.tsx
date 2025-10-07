import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(2, 1);
        const material = new THREE.MeshPhongMaterial({
            color: 0x10b981,
            wireframe: false,
            transparent: true,
            opacity: 0.7,
            emissive: 0x059669,
            emissiveIntensity: 0.3,
            shininess: 100,
            flatShading: true
        });

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        const wireframeGeometry = new THREE.IcosahedronGeometry(2.05, 1);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x34d399,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const wireframeSphere = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        scene.add(wireframeSphere);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0x10b981, 1);
        directionalLight1.position.set(5, 5, 5);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x14b8a6, 0.5);
        directionalLight2.position.set(-5, -5, -5);
        scene.add(directionalLight2);

        camera.position.z = 5;

        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const onMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / container.clientWidth) * 2 - 1;
            mouseY = -(event.clientY / container.clientHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', onMouseMove);

        const animate = () => {
            requestAnimationFrame(animate);

            targetX = mouseX * 0.3;
            targetY = mouseY * 0.3;

            sphere.rotation.x += 0.005;
            sphere.rotation.y += 0.005;
            sphere.rotation.x += (targetY - sphere.rotation.x) * 0.05;
            sphere.rotation.y += (targetX - sphere.rotation.y) * 0.05;

            wireframeSphere.rotation.x = sphere.rotation.x;
            wireframeSphere.rotation.y = sphere.rotation.y;
            wireframeSphere.rotation.z += 0.002;

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            resizeObserver.disconnect();
            container.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            wireframeGeometry.dispose();
            wireframeMaterial.dispose();
            renderer.dispose();
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