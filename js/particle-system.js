class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || typeof THREE === "undefined") return;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 8);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.mouse = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };

    this.running = true;

    this.initParticles();
    this.bind();
    this.animate();
  }

  initParticles() {
    const isMobile = matchMedia("(max-width: 768px)").matches;
    const count = isMobile ? 1600 : 2600;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color("#E8DCC4"),
      new THREE.Color("#C9A567"),
      new THREE.Color("#A68953"),
      new THREE.Color("#FFFFFF"),
    ];

    for (let i = 0; i < count; i++) {
      const r = 6 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const c = palette[(Math.random() * palette.length) | 0];

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geometry, material);
    this.group.add(this.points);
  }

  bind() {
    window.addEventListener("mousemove", (e) => {
      this.target.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.target.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener("resize", () => this.resize(), { passive: true });

    document.addEventListener("visibilitychange", () => {
      this.running = document.visibilityState === "visible";
    });
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    const tick = () => {
      requestAnimationFrame(tick);
      if (!this.running) return;

      // smooth mouse
      this.mouse.x += (this.target.x - this.mouse.x) * 0.05;
      this.mouse.y += (this.target.y - this.mouse.y) * 0.05;

      // subtle camera parallax (cheap + premium)
      this.camera.position.x = this.mouse.x * 0.6;
      this.camera.position.y = this.mouse.y * 0.35;
      this.camera.lookAt(0, 0, 0);

      // slow rotation
      const t = performance.now() * 0.0001;
      this.group.rotation.y = t * 1.2;
      this.group.rotation.x = t * 0.6;

      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }
}
