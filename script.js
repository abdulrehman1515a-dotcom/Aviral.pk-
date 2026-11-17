/* ========= SETTINGS (edit here) ========= */
const STORE_NAME = "aviral.pk";
// WhatsApp number in international format, digits only.
// 965 = Kuwait country code. Change to 92 for Pakistan, etc.
const WHATSAPP_NUMBER = "96566905351";
const CURRENCY = "KD"; // change to PKR, USD, etc.

const PRODUCTS = [
  { id: 1, name: "Wireless Earbuds",  cat: "Electronics", price: 12,  emoji: "🎧", color: "linear-gradient(135deg,#ffd27a,#ff9a62)" },
  { id: 2, name: "Smart Watch",       cat: "Electronics", price: 25,  emoji: "⌚", color: "linear-gradient(135deg,#9ad9ff,#6b8cff)" },
  { id: 3, name: "Leather Wallet",    cat: "Fashion",     price: 9,   emoji: "👛", color: "linear-gradient(135deg,#ffb3c1,#ff6f91)" },
  { id: 4, name: "Sport Sneakers",    cat: "Fashion",     price: 30,  emoji: "👟", color: "linear-gradient(135deg,#b8f2d8,#2ec4a6)" },
  { id: 5, name: "Ceramic Mug Set",   cat: "Home",        price: 8,   emoji: "☕", color: "linear-gradient(135deg,#ffe29a,#ffb627)" },
  { id: 6, name: "Desk Lamp",         cat: "Home",        price: 14,  emoji: "💡", color: "linear-gradient(135deg,#d6c2ff,#8e6bff)" }
];

/* ========= HELPERS ========= */
const $ = (s) => document.querySelector(s);
let cart = JSON.parse(localStorage.getItem("aviral_cart") || "[]");
let activeCat = "All";

const waLink = (text = "Hello aviral.pk, I have a question.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

["#waHero", "#waFooter", "#waFloat"].forEach((id) => ($(id).href = waLink()));
$("#year").textContent = new Date().getFullYear();

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ========= PRODUCTS ========= */
function renderFilters() {
  const cats = ["All", ...new Set(PRODUCTS.map((p) => p.cat))];
  $("#filters").innerHTML = cats
    .map((c) => `<button class="chip ${c === activeCat ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderProducts() {
  const list = PRODUCTS.filter((p) => activeCat === "All" || p.cat === activeCat);
  $("#grid").innerHTML = list
    .map(
      (p) => `
    <article class="card">
      <div class="art" style="background:${p.color}"><span>${p.emoji}</span></div>
      <h3>${p.name}</h3>
      <div class="cat">${p.cat}</div>
      <div class="row">
        <span class="price">${CURRENCY} ${p.price}</span>
        <button class="add" data-id="${p.id}">Add to cart</button>
      </div>
    </article>`
    )
    .join("");
  attachTilt();
}

$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  activeCat = b.dataset.cat;
  renderFilters();
  renderProducts();
});

$("#grid").addEventListener("click", (e) => {
  const b = e.target.closest(".add");
  if (!b) return;
  addToCart(+b.dataset.id);
});

/* 3D tilt on product cards */
function attachTilt() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 18}deg) translateZ(10px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });
}

/* ========= CART ========= */
function save() {
  localStorage.setItem("aviral_cart", JSON.stringify(cart));
}

function addToCart(id) {
  const found = cart.find((i) => i.id === id);
  found ? found.qty++ : cart.push({ id, qty: 1 });
  save();
  renderCart();
  const btn = $(".cart-btn");
  btn.classList.remove("bump");
  void btn.offsetWidth;
  btn.classList.add("bump");
  toast("Added to cart");
}

function changeQty(id, d) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  save();
  renderCart();
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * PRODUCTS.find((p) => p.id === i.id).price, 0);
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = `${CURRENCY} ${total}`;
  $("#cartItems").innerHTML = cart.length
    ? cart
        .map((i) => {
          const p = PRODUCTS.find((x) => x.id === i.id);
          return `<div class="item">
            <div class="thumb" style="background:${p.color}">${p.emoji}</div>
            <div><strong>${p.name}</strong><br><small>${CURRENCY} ${p.price}</small>
              <div class="qty"><button data-q="-1" data-id="${p.id}">−</button><span>${i.qty}</span><button data-q="1" data-id="${p.id}">+</button></div>
            </div>
            <strong>${CURRENCY} ${p.price * i.qty}</strong>
          </div>`;
        })
        .join("")
    : `<p class="empty">Your cart is empty. Add something you like.</p>`;
}

$("#cartItems").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-q]");
  if (b) changeQty(+b.dataset.id, +b.dataset.q);
});

$("#clearCart").addEventListener("click", () => {
  cart = [];
  save();
  renderCart();
});

function toggleDrawer(open) {
  $("#drawer").classList.toggle("open", open);
  $("#overlay").classList.toggle("show", open);
  $("#drawer").setAttribute("aria-hidden", !open);
}
$("#openCart").addEventListener("click", () => toggleDrawer(true));
$("#closeCart").addEventListener("click", () => toggleDrawer(false));
$("#overlay").addEventListener("click", () => toggleDrawer(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && toggleDrawer(false));

$("#checkout").addEventListener("click", () => {
  if (!cart.length) return toast("Your cart is empty");
  let total = 0;
  const lines = cart.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    total += p.price * i.qty;
    return `• ${p.name} x${i.qty} = ${CURRENCY} ${p.price * i.qty}`;
  });
  const msg = `Hello ${STORE_NAME}, I want to order:\n${lines.join("\n")}\n\nTotal: ${CURRENCY} ${total}\n\nName:\nAddress:`;
  window.open(waLink(msg), "_blank");
});

renderFilters();
renderProducts();
renderCart();

/* ========= 3D HERO (Three.js) ========= */
(function hero3D() {
  const canvas = $("#scene");
  if (!window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.PointLight(0xffb627, 1.4, 60);
  key.position.set(5, 5, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0xff5d73, 1.1, 60);
  rim.position.set(-6, -3, 4);
  scene.add(rim);

  /* Logo texture drawn on canvas */
  function logoTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d");
    g.fillStyle = "#ffb627";
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "#151233";
    g.lineWidth = 56;
    g.lineCap = g.lineJoin = "round";
    g.beginPath();
    g.moveTo(140, 390); g.lineTo(256, 120); g.lineTo(372, 390);
    g.moveTo(190, 310); g.lineTo(322, 310);
    g.stroke();
    return new THREE.CanvasTexture(c);
  }

  /* Central logo cube */
  const hero = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 2.6, 2.6),
    new THREE.MeshStandardMaterial({ map: logoTexture(), roughness: 0.35, metalness: 0.2 })
  );
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(2.62, 2.62, 2.62)),
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  const group = new THREE.Group();
  group.add(hero, edges);
  scene.add(group);

  /* Orbiting shapes */
  const colors = [0xff5d73, 0x2ec4a6, 0xffb627, 0x8e6bff, 0x6bb8ff];
  const geos = [
    new THREE.IcosahedronGeometry(0.45),
    new THREE.OctahedronGeometry(0.5),
    new THREE.TorusGeometry(0.4, 0.15, 16, 40),
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.TetrahedronGeometry(0.55)
  ];
  const orbiters = geos.map((geo, i) => {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.3, metalness: 0.3 }));
    m.userData = { r: 3.4 + i * 0.5, s: 0.25 + i * 0.07, a: (i / geos.length) * Math.PI * 2, y: (i - 2) * 0.6 };
    scene.add(m);
    return m;
  });

  /* Star particles */
  const pts = new Float32Array(300 * 3);
  for (let i = 0; i < pts.length; i++) pts[i] = (Math.random() - 0.5) * 30;
  const stars = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pts, 3)),
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.6 })
  );
  scene.add(stars);

  /* Layout + mouse */
  const mouse = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / innerHeight - 0.5) * 2;
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const wide = w > 800;
    group.position.x = wide ? 3 : 0;
    group.position.y = wide ? 0 : -1.8;
    group.scale.setScalar(wide ? 1 : 0.75);
  }
  addEventListener("resize", resize);
  resize();

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new THREE.Clock();
  (function loop() {
    const t = clock.getElapsedTime();
    if (!reduced) {
      group.rotation.y = t * 0.5 + mouse.x * 0.6;
      group.rotation.x = Math.sin(t * 0.6) * 0.25 + mouse.y * 0.4;
      group.position.y += (Math.sin(t) * 0.25 - (group.position.y - (group.position.x ? 0 : -1.8))) * 0.02;
      orbiters.forEach((m) => {
        const d = m.userData, a = d.a + t * d.s;
        m.position.set(group.position.x + Math.cos(a) * d.r, group.position.y + d.y + Math.sin(a * 2) * 0.4, Math.sin(a) * d.r * 0.6);
        m.rotation.x += 0.01;
        m.rotation.y += 0.014;
      });
      stars.rotation.y = t * 0.02;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })();
})();