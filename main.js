/* ===== Shared site script ===== */

// ---------- Theme toggle (persisted in memory only, artifact-safe) ----------
(function theme() {
  const root = document.documentElement;
  let saved = "dark";
  try { saved = localStorage.getItem("site-theme") || "dark"; } catch (e) {}
  root.setAttribute("data-theme", saved);
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".theme-toggle")) return;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("site-theme", next); } catch (e) {}
    window.dispatchEvent(new Event("themechange"));
  });
})();

// ---------- Inject identical nav + footer on every page ----------
const PAGES = [
  { href: "index.html", label: "Home" },
  { href: "services.html", label: "Services" },
  { href: "about.html", label: "Our Team" },
  { href: "book.html", label: "Book Visit" },
  { href: "contact.html", label: "Contact" }
];

(function injectChrome() {
  const current = location.pathname.split("/").pop() || "index.html";

  const nav = document.createElement("header");
  nav.innerHTML = `
    <nav class="nav">
      <a href="index.html" class="logo">Bright<span>Smile</span>Dental</a>
      <ul class="nav-links" id="navLinks">
        ${PAGES.map(p => `<li><a href="${p.href}" class="${p.href === current ? "active" : ""}">${p.label}</a></li>`).join("")}
      </ul>
      <div class="nav-right">
        <button class="theme-toggle" aria-label="Toggle light and dark theme"></button>
        <button class="menu-btn" id="menuBtn" aria-label="Open menu">☰</button>
      </div>
    </nav>`;
  document.body.prepend(nav);

  const curtain = document.createElement("div");
  curtain.className = "page-curtain";
  document.body.prepend(curtain);
  requestAnimationFrame(() => curtain.classList.add("leave"));

  const progress = document.createElement("div");
  progress.className = "progress";
  document.body.prepend(progress);

  const cursorDot = document.createElement("div");
  cursorDot.className = "cursor-dot";
  const cursorRing = document.createElement("div");
  cursorRing.className = "cursor-ring";
  document.body.append(cursorDot, cursorRing);

  const footer = document.createElement("footer");
  footer.innerHTML = `
    <div class="footer-grid">
      <div>
        <div class="logo" style="margin-bottom:14px">Bright<span>Smile</span>Dental</div>
        <p style="color:var(--muted);max-width:340px">Gentle, modern dental care with advanced 3D imaging for the whole family.</p>
        <form class="newsletter" onsubmit="event.preventDefault();window.toast('Thanks for subscribing!');this.reset();">
          <input type="email" placeholder="Your email" required>
          <button type="submit">Subscribe</button>
        </form>
      </div>
      <div><h4>Explore</h4><ul>${PAGES.map(p => `<li><a href="${p.href}">${p.label}</a></li>`).join("")}</ul></div>
      <div><h4>Care</h4><ul><li>General Dentistry</li><li>Cosmetic Smiles</li><li>Implants</li><li>Emergency Care</li></ul></div>
      <div><h4>Clinic</h4><ul><li><a href="mailto:care@brightsmiledental.com">care@brightsmiledental.com</a></li><li>+1 (555) 044-8120</li><li>Mon–Sat, 8am–6pm</li></ul></div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 BrightSmile Dental. All rights reserved.</span>
      <span>Privacy · Terms</span>
    </div>`;
  document.body.append(footer);

  const toast = document.createElement("div");
  toast.className = "toast";
  document.body.append(toast);
  window.toast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  };

  // Mobile menu
  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("open");
  });

  // Cursor
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + "px"; cursorDot.style.top = my + "px";
  });
  (function animCursor() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    cursorRing.style.left = rx + "px"; cursorRing.style.top = ry + "px";
    requestAnimationFrame(animCursor);
  })();
  document.addEventListener("mouseover", (e) => {
    cursorRing.classList.toggle("hover", !!e.target.closest("a, button, .card, .project, input, textarea"));
  });

  // Scroll progress
  window.addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (scrollY / h * 100) + "%";
  });

  // Page exit transition for internal links
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || a.href.startsWith("mailto:") || a.href.startsWith("#")) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => (location.href = a.href), 650);
  });
})();

// ---------- Scroll reveals ----------
(function reveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
})();

// ---------- Tilt + spotlight cards ----------
(function tilt() {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty("--mx", x + "px");
      card.style.setProperty("--my", y + "px");
      const rx = ((y / r.height) - 0.5) * -8;
      const ry = ((x / r.width) - 0.5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
})();

// ---------- Counters ----------
(function counters() {
  const els = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, suffix = el.dataset.suffix || "";
      const start = performance.now(), dur = 1600;
      (function step(t) {
        const p = Math.min((t - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
      io.unobserve(el);
    });
  });
  els.forEach(el => io.observe(el));
})();

// ---------- Three.js helpers ----------
function makeScene(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, opts.camZ || 8);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let mouse = { x: 0, y: 0 };
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / innerHeight - 0.5) * 2;
  });

  const colors = () => {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    return {
      a: new THREE.Color(light ? 0x5b3df5 : 0x7c5cff),
      b: new THREE.Color(light ? 0x00a892 : 0x00e0c6),
      light,
    };
  };

  function loop(fn) {
    const clock = new THREE.Clock();
    (function frame() {
      const t = clock.getElapsedTime();
      fn(t, mouse, colors());
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    })();
  }
  return { renderer, scene, camera, loop, colors };
}

// Hero: floating morphing wireframe knot + particle field
function heroScene() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || !window.THREE) return;
  const { scene, loop, colors } = makeScene(canvas, { camZ: 9 });

  const geo = new THREE.TorusKnotGeometry(1.6, 0.46, 220, 32);
  const mat = new THREE.MeshStandardMaterial({ color: 0x7c5cff, metalness: 0.6, roughness: 0.2, wireframe: false });
  const knot = new THREE.Mesh(geo, mat);
  knot.position.set(2.6, 0, 0);
  scene.add(knot);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.4, 2),
    new THREE.MeshBasicMaterial({ color: 0x00e0c6, wireframe: true, transparent: true, opacity: 0.12 })
  );
  wire.position.copy(knot.position);
  scene.add(wire);

  const count = 1400;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
  }
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pmat = new THREE.PointsMaterial({ size: 0.04, color: 0xffffff, transparent: true, opacity: 0.6 });
  const points = new THREE.Points(pgeo, pmat);
  scene.add(points);

  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(5, 5, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0x00e0c6, 2, 30);
  rim.position.set(-6, -2, 4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  loop((t, m, c) => {
    knot.rotation.x = t * 0.25 + m.y * 0.4;
    knot.rotation.y = t * 0.35 + m.x * 0.4;
    knot.position.y = Math.sin(t * 0.8) * 0.25;
    wire.rotation.y = -t * 0.08;
    wire.rotation.x = t * 0.04;
    points.rotation.y = t * 0.02;
    mat.color.lerp(c.a, 0.05);
    rim.color.lerp(c.b, 0.05);
    wire.material.color.lerp(c.b, 0.05);
    pmat.color.setHex(c.light ? 0x222222 : 0xffffff);
  });
}

// Inner-page hero: rotating crystal cluster
function pageScene() {
  const canvas = document.getElementById("page-canvas");
  if (!canvas || !window.THREE) return;
  const { scene, loop, colors } = makeScene(canvas, { camZ: 9 });

  const group = new THREE.Group();
  scene.add(group);
  const mat = new THREE.MeshStandardMaterial({ color: 0x7c5cff, metalness: 0.7, roughness: 0.15 });
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.55 + Math.random() * 0.5, 0), mat);
    const a = (i / 9) * Math.PI * 2;
    m.position.set(Math.cos(a) * 3.2, Math.sin(a * 2) * 0.8, Math.sin(a) * 1.4);
    m.userData.base = m.position.clone();
    group.add(m);
  }
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const l = new THREE.PointLight(0xffffff, 2, 40);
  l.position.set(4, 4, 6);
  scene.add(l);

  loop((t, m, c) => {
    group.rotation.y = t * 0.15 + m.x * 0.3;
    group.rotation.x = m.y * 0.2;
    group.children.forEach((ch, i) => {
      ch.position.y = ch.userData.base.y + Math.sin(t * 1.2 + i) * 0.2;
      ch.rotation.x = t * 0.5 + i;
      ch.rotation.z = t * 0.3;
    });
    mat.color.lerp(c.a, 0.05);
  });
}

// Portfolio cards: each project gets its own animated 3D thumbnail
function projectThumbs() {
  if (!window.THREE) return;
  document.querySelectorAll("canvas[data-thumb]").forEach((canvas, idx) => {
    const { scene, loop } = makeScene(canvas, { camZ: 5 });
    const kinds = [
      () => new THREE.TorusGeometry(1, 0.35, 32, 100),
      () => new THREE.IcosahedronGeometry(1.2, 0),
      () => new THREE.TorusKnotGeometry(0.9, 0.25, 120, 16),
      () => new THREE.DodecahedronGeometry(1.2, 0),
      () => new THREE.ConeGeometry(1, 2, 6),
      () => new THREE.SphereGeometry(1.1, 32, 32),
    ];
    const geo = kinds[idx % kinds.length]();
    const mat = new THREE.MeshStandardMaterial({ color: [0x7c5cff, 0x00e0c6, 0xff6b9d][idx % 3], metalness: 0.5, roughness: 0.25 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    scene.add(new THREE.DirectionalLight(0xffffff, 1.4).translateX(3).translateY(3).translateZ(4));
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    loop((t) => {
      mesh.rotation.x = t * 0.4;
      mesh.rotation.y = t * 0.6;
    });
  });
}

// Services: floating rotating particle sphere background
function ambientSphere() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas || !window.THREE) return;
  const { scene, loop } = makeScene(canvas, { camZ: 10 });
  const n = 2400, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random(), v = Math.random();
    const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1), r = 4;
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ size: 0.03, color: 0x7c5cff, transparent: true, opacity: 0.8 });
  const pts = new THREE.Points(g, m);
  scene.add(pts);
  loop((t, mo, c) => {
    pts.rotation.y = t * 0.1;
    pts.rotation.x = mo.y * 0.2;
    m.color.lerp(c.a, 0.05);
  });
}

// Contact: animated gradient orb
function contactOrb() {
  const canvas = document.getElementById("orb-canvas");
  if (!canvas || !window.THREE) return;
  const { scene, loop } = makeScene(canvas, { camZ: 6 });
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 64, 64),
    new THREE.MeshStandardMaterial({ color: 0x00e0c6, metalness: 0.3, roughness: 0.1, emissive: 0x7c5cff, emissiveIntensity: 0.25 })
  );
  scene.add(mesh);
  const l1 = new THREE.PointLight(0x7c5cff, 3, 30); l1.position.set(3, 2, 4); scene.add(l1);
  const l2 = new THREE.PointLight(0x00e0c6, 2, 30); l2.position.set(-3, -2, 3); scene.add(l2);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  loop((t) => {
    mesh.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);
    mesh.rotation.y = t * 0.3;
    l1.position.x = Math.cos(t) * 4;
    l1.position.z = Math.sin(t) * 4 + 3;
  });
}

// Boot scenes after Three.js has loaded
window.addEventListener("load", () => {
  heroScene();
  pageScene();
  projectThumbs();
  ambientSphere();
  contactOrb();
});
