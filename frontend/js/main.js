let scene, camera, renderer, controls;
let totalPoints = 0;
let suspiciousCount = 0;

function init() {
    // Scene setup
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Earth
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('earth_texture.jpg');
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpScale: 0.05,
        specular: new THREE.Color('grey'),
        shininess: 5
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    for(let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starsVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.7 });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    const eventSource = new EventSource('http://localhost:5000/stream');
    eventSource.onmessage = (event) => {
        console.log('Получены данные:', event.data);
        const data = JSON.parse(event.data);
        addDataPoint(data);
    };

    animate();
}

function addDataPoint(pkg) {
    const lat = parseFloat(pkg.Latitude);
    const lng = parseFloat(pkg.Longitude);
    const suspicious = parseFloat(pkg['suspicious']);

    const phi = (90 - lat) * Math.PI / 180;
    const theta = (180 - lng) * Math.PI / 180;
    const radius = 5.1;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: suspicious > 0 ? 0xff0000 : 0x00ff00
    });
    const point = new THREE.Mesh(geometry, material);
    point.position.set(x, y, z);

    totalPoints++;
    if (suspicious > 0) suspiciousCount++;

    document.getElementById('total-points').textContent = totalPoints;
    document.getElementById('suspicious-count').textContent = suspiciousCount;

    scene.add(point);

    setTimeout(() => scene.remove(point), 10000);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
