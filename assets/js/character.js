
const box = document.getElementById('viewer'), hint = document.getElementById('viewer-hint');
let started = false;
new IntersectionObserver((es, o) => {
  if (es[0].isIntersecting && !started) { started = true; o.disconnect(); start(); }
}, { rootMargin: '300px' }).observe(box);

async function start() {
  try {
    const THREE = await import('three');
    const { FBXLoader } = await import('../vendor/three/loaders/FBXLoader.js');
    hint.textContent = 'CARGANDO MODELO…';
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.15;
    box.appendChild(r.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cam.position.set(0, 1.15, 6.2); cam.lookAt(0, 1, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x393932, 2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(4, 6, 6); scene.add(key);
    const c1 = new THREE.PointLight(0xd62e2c, 60, 20); c1.position.set(-3, 2.5, -2); scene.add(c1);
    const c2 = new THREE.PointLight(0xffffff, 50, 20); c2.position.set(3, 1.5, -2.5); scene.add(c2);

    const tex = await new THREE.TextureLoader().loadAsync('assets/modelo/textura.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    const obj = await new FBXLoader().loadAsync('assets/modelo/android.fbx');
    obj.traverse(o => { if (o.isMesh) o.material = new THREE.MeshStandardMaterial({ map: tex, roughness: .45, metalness: .35 }); });
    obj.rotation.x = -Math.PI / 2; obj.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(obj), size = b.getSize(new THREE.Vector3());
    obj.scale.multiplyScalar(2 / size.y); obj.updateMatrixWorld(true);
    b.setFromObject(obj); const ctr = b.getCenter(new THREE.Vector3());
    obj.position.sub(new THREE.Vector3(ctr.x, b.min.y, ctr.z));
    const pivot = new THREE.Group(); pivot.add(obj); scene.add(pivot);

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.02, 64), new THREE.MeshBasicMaterial({ color: 0xd62e2c, transparent: true, opacity: .6, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.005; scene.add(ring);

    // giro: scroll + arrastre con el mouse/dedo
    let drag = 0, dragging = false, lastX = 0;
    const el = r.domElement;
    el.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => { if (dragging) { drag += (e.clientX - lastX) * 0.012; lastX = e.clientX; } });
    el.addEventListener('pointerup', () => dragging = false);
    el.addEventListener('pointercancel', () => dragging = false);

    const resize = () => { const w = box.clientWidth, h = box.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(box); resize();

    const motion = () => !document.body.classList.contains("motion-paused") && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true, yaw = -0.45, t = 0;
    new IntersectionObserver(es => visible = es[0].isIntersecting).observe(box);
    r.setAnimationLoop(() => {
      if (!visible || document.hidden) return;
      if (motion()) t += 0.016;
      const target = (motion() ? -1.6 + (window.charScroll ?? 0.35) * 3.2 : -0.45) + drag;   // gira de un lado a otro al bajar
      yaw += (target - yaw) * 0.08;
      pivot.rotation.y = yaw;
      pivot.position.y = Math.sin(t * 2) * 0.04;                         // flota
      ring.material.opacity = 0.45 + Math.sin(t * 3) * 0.15;
      r.render(scene, cam);
    });
    box.classList.add('ready');
    hint.textContent = 'BAJA O ARRASTRA PARA GIRAR';
  } catch (e) {
    console.warn('Visor 3D no disponible:', e);
    hint.textContent = 'VISTA DEL PERSONAJE · WEBGL NO DISPONIBLE';
  }
}
