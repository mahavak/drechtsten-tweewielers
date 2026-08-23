(function () {
  var fallback = document.getElementById('scooter-fallback');

  function showFallback() {
    if (canvas) canvas.hidden = true;
    if (fallback) fallback.hidden = false;
  }

  var canvas = document.getElementById('scooter-canvas');
  if (!canvas) {
    showFallback();
    return;
  }

  if (typeof THREE === 'undefined') {
    showFallback();
    return;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  } catch (err) {
    showFallback();
    return;
  }

  if (!renderer || !renderer.getContext || !renderer.getContext()) {
    showFallback();
    return;
  }

  renderer.setClearColor(0x4a3424, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(2.2, 1.35, 3.15);
  camera.lookAt(0, 0.85, 0);

  scene.add(new THREE.AmbientLight(0xffe6c8, 1.05));
  var key = new THREE.DirectionalLight(0xfff6e4, 2.15);
  key.position.set(3.2, 5.4, 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xb8d8ff, 0x6b4e32, 0.7));
  var rim = new THREE.DirectionalLight(0xff9a2e, 1.05);
  rim.position.set(-3.4, 2.2, -1.8);
  scene.add(rim);
  var fill = new THREE.DirectionalLight(0xfff0d0, 0.75);
  fill.position.set(-1.2, 3.4, 4);
  scene.add(fill);

  var scooter = new THREE.Group();
  scene.add(scooter);

  var body = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.42, metalness: 0.28 });
  var accent = new THREE.MeshStandardMaterial({ color: 0xff9a2e, roughness: 0.38, metalness: 0.18 });
  var chrome = new THREE.MeshStandardMaterial({ color: 0xe4e1d8, roughness: 0.2, metalness: 0.85 });
  var rubber = new THREE.MeshStandardMaterial({ color: 0x2a2724, roughness: 0.9, metalness: 0.05 });
  var seatMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.75, metalness: 0.05 });
  var glass = new THREE.MeshStandardMaterial({
    color: 0x9ad4ff,
    roughness: 0.08,
    metalness: 0.2,
    transparent: true,
    opacity: 0.4
  });

  var WHEEL_R = 0.36;
  var TUBE = 0.085;
  var OUTER = 0.445;
  var REAR_X = -0.9;
  var FRONT_X = 1.15;
  var TREE = { x: 1.02, y: 1.28, z: 0.09 };
  var AXLE_Z = 0.11;

  function mesh(geo, mat, x, y, z, rx, ry, rz) {
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = true;
    m.receiveShadow = true;
    scooter.add(m);
    return m;
  }

  function strut(ax, ay, az, bx, by, bz, radius, mat) {
    var dx = bx - ax;
    var dy = by - ay;
    var dz = bz - az;
    var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    var m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 10), mat);
    m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(dx / len, dy / len, dz / len)
    );
    m.castShadow = true;
    m.receiveShadow = true;
    scooter.add(m);
    return m;
  }

  function wheel(x) {
    var g = new THREE.Group();
    var tire = new THREE.Mesh(new THREE.TorusGeometry(WHEEL_R, TUBE, 16, 32), rubber);
    var rimM = new THREE.Mesh(new THREE.CylinderGeometry(WHEEL_R - 0.02, WHEEL_R - 0.02, 0.055, 22), chrome);
    rimM.rotation.x = Math.PI / 2;
    var disc = new THREE.Mesh(new THREE.CylinderGeometry(WHEEL_R * 0.72, WHEEL_R * 0.72, 0.02, 22), chrome);
    disc.rotation.x = Math.PI / 2;
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 12), accent);
    hub.rotation.x = Math.PI / 2;
    g.add(tire, rimM, disc, hub);
    g.position.set(x, OUTER, 0);
    g.traverse(function (o) {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    scooter.add(g);
    return g;
  }

  var rear = wheel(REAR_X);
  var front = wheel(FRONT_X);

  mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.3, 10), chrome, FRONT_X, OUTER, 0, Math.PI / 2, 0, 0);
  mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.26, 10), chrome, REAR_X, OUTER, 0, Math.PI / 2, 0, 0);

  strut(TREE.x, TREE.y, TREE.z, FRONT_X, OUTER, AXLE_Z, 0.032, chrome);
  strut(TREE.x, TREE.y, -TREE.z, FRONT_X, OUTER, -AXLE_Z, 0.032, chrome);
  mesh(new THREE.BoxGeometry(0.16, 0.07, 0.24), chrome, TREE.x, TREE.y, 0);

  strut(-0.18, 0.58, 0.16, REAR_X, OUTER, AXLE_Z, 0.028, chrome);
  strut(-0.18, 0.58, -0.16, REAR_X, OUTER, -AXLE_Z, 0.028, chrome);
  strut(-0.55, 0.72, 0.12, REAR_X + 0.08, OUTER + 0.12, AXLE_Z, 0.022, chrome);
  strut(-0.55, 0.72, -0.12, REAR_X + 0.08, OUTER + 0.12, -AXLE_Z, 0.022, chrome);

  mesh(new THREE.BoxGeometry(1.55, 0.08, 0.44), body, 0.12, 0.54, 0);
  mesh(new THREE.BoxGeometry(0.72, 0.14, 0.4), accent, 0.28, 0.62, 0);
  mesh(new THREE.BoxGeometry(0.55, 0.28, 0.36), body, -0.42, 0.78, 0);
  mesh(new THREE.BoxGeometry(0.62, 0.16, 0.4), seatMat, -0.52, 0.98, 0);
  mesh(new THREE.BoxGeometry(0.2, 0.42, 0.16), body, REAR_X + 0.08, 0.78, 0);

  mesh(new THREE.BoxGeometry(0.16, 0.82, 0.58), accent, 0.98, 1.12, 0, 0.12, 0, 0);
  mesh(new THREE.BoxGeometry(0.05, 0.52, 0.46), glass, 1.08, 1.48, 0, 0.16, 0, 0);

  mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.22, 8), chrome, TREE.x, 1.4, 0);
  mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.82, 10), chrome, TREE.x, 1.58, 0, 0, 0, Math.PI / 2);
  mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.15, 8), rubber, TREE.x, 1.58, 0.38, 0, 0, Math.PI / 2);
  mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.15, 8), rubber, TREE.x, 1.58, -0.38, 0, 0, Math.PI / 2);
  mesh(new THREE.BoxGeometry(0.14, 0.09, 0.2), accent, TREE.x - 0.02, 1.5, 0);

  mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.055, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xffcc66,
      emissiveIntensity: 1.1,
      roughness: 0.2
    }),
    1.08,
    1.08,
    0,
    0,
    0,
    Math.PI / 2
  );
  mesh(
    new THREE.BoxGeometry(0.055, 0.055, 0.07),
    new THREE.MeshStandardMaterial({ color: 0xff9a2e, emissive: 0xff9a2e, emissiveIntensity: 0.55 }),
    1.04,
    1.22,
    0.26
  );
  mesh(
    new THREE.BoxGeometry(0.055, 0.055, 0.07),
    new THREE.MeshStandardMaterial({ color: 0xff9a2e, emissive: 0xff9a2e, emissiveIntensity: 0.55 }),
    1.04,
    1.22,
    -0.26
  );

  var floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 36),
    new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.95, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  function fit() {
    var w = canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth) || 320;
    var h = canvas.clientHeight || 352;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }
  fit();
  window.addEventListener('resize', fit);

  var t0 = performance.now();
  function tick(now) {
    var t = (now - t0) / 1000;
    if (!reduceMotion) {
      scooter.rotation.y = Math.sin(t * 0.55) * 0.55 + 0.35;
      front.rotation.z = t * 1.6;
      rear.rotation.z = t * 1.6;
    } else {
      scooter.rotation.y = 0.4;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
