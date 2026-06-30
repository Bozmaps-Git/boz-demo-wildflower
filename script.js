/* =========================================================
   Wildflower & Fern — vanilla JS
   No frameworks, no build. Everything is progressive + accessible.
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fmt = (n) => "£" + n.toFixed(2);

  /* ---------------------------------------------------------
     Header shadow on scroll
  --------------------------------------------------------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Mobile menu
  --------------------------------------------------------- */
  const hamburger = $(".hamburger");
  const mobileMenu = $("#mobile-menu");
  const overlay = $("#overlay");

  function openMenu() {
    mobileMenu.classList.add("open");
    overlay.classList.add("show");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    const first = $("a, button", mobileMenu);
    if (first) first.focus();
  }
  function closeMenu() {
    mobileMenu.classList.remove("open");
    if (!$(".cart-drawer.open")) overlay.classList.remove("show");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  hamburger.addEventListener("click", () =>
    mobileMenu.classList.contains("open") ? closeMenu() : openMenu()
  );
  $(".mobile-close").addEventListener("click", closeMenu);
  $$(".mobile-menu a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------------------------------------------------------
     Overlay closes whichever panel is open
  --------------------------------------------------------- */
  overlay.addEventListener("click", () => {
    closeMenu();
    closeCart();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      closeCart();
      closeLightbox();
    }
  });

  /* ---------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* =========================================================
     FEATURE A — Gallery filter + lightbox
  ========================================================= */
  const galleryData = [
    { seed: "wf-spring1", cat: "spring", title: "Hedgerow Posy", note: "Cow parsley, ranunculus & sweet pea, gathered loose and airy." },
    { seed: "wf-summer1", cat: "summer", title: "Sun-Warmed Meadow", note: "Cosmos, scabious and grasses in soft apricot and butter tones." },
    { seed: "wf-autumn1", cat: "autumn", title: "Amber Harvest", note: "Dahlias, rosehips and copper beech, rich and romantic." },
    { seed: "wf-winter1", cat: "winter", title: "Frosted Stems", note: "Anemones, eucalyptus and ranunculus in chalky winter whites." },
    { seed: "wf-spring2", cat: "spring", title: "Tulip Tumble", note: "Heirloom parrot tulips with flowering currant and blossom." },
    { seed: "wf-summer2", cat: "summer", title: "Garden Roses", note: "Scented English roses, foxglove spires and trailing jasmine." },
    { seed: "wf-autumn2", cat: "autumn", title: "Smoke & Spice", note: "Smokebush, chocolate cosmos and seedheads for the table." },
    { seed: "wf-winter2", cat: "winter", title: "Evergreen Wreath", note: "Spruce, berried ivy and dried orange — hand-tied for the door." },
    { seed: "wf-spring3", cat: "spring", title: "Narcissi Bunch", note: "Fragrant paperwhites and grape hyacinth, simple and joyful." },
  ];

  const galleryEl = $("#gallery");
  galleryData.forEach((g, i) => {
    const fig = document.createElement("button");
    fig.className = "gallery-item reveal";
    fig.setAttribute("data-cat", g.cat);
    fig.setAttribute("data-index", i);
    fig.setAttribute("aria-label", "View " + g.title + " arrangement larger");
    fig.innerHTML =
      '<img src="https://picsum.photos/seed/' + g.seed + '/600/700" alt="' +
      g.title + ' — ' + g.note + '" loading="lazy" />' +
      '<figcaption>' + g.title + '<small>' + g.cat + '</small></figcaption>';
    fig.addEventListener("click", () => openLightbox(i));
    galleryEl.appendChild(fig);
  });
  // observe the newly added reveal items
  $$("#gallery .reveal").forEach((el) => el.classList.add("in"));

  $$(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".filter-btn").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      const cat = btn.dataset.filter;
      $$(".gallery-item").forEach((item) => {
        const show = cat === "all" || item.dataset.cat === cat;
        item.classList.toggle("hide", !show);
      });
    });
  });

  // Lightbox
  const lightbox = $("#lightbox");
  const lbImg = $("#lb-img");
  const lbTitle = $("#lb-title");
  const lbNote = $("#lb-note");
  let lbIndex = 0;
  let lbLastFocus = null;

  function visibleIndices() {
    return $$(".gallery-item")
      .filter((el) => !el.classList.contains("hide"))
      .map((el) => +el.dataset.index);
  }
  function renderLb() {
    const g = galleryData[lbIndex];
    lbImg.src = "https://picsum.photos/seed/" + g.seed + "/900/640";
    lbImg.alt = g.title + " — " + g.note;
    lbTitle.textContent = g.title;
    lbNote.textContent = g.note;
  }
  function openLightbox(i) {
    lbIndex = i;
    lbLastFocus = document.activeElement;
    renderLb();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    $(".lightbox-close").focus();
  }
  function closeLightbox() {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    if (lbLastFocus) lbLastFocus.focus();
  }
  function step(dir) {
    const vis = visibleIndices();
    if (!vis.length) return;
    let pos = vis.indexOf(lbIndex);
    pos = (pos + dir + vis.length) % vis.length;
    lbIndex = vis[pos];
    renderLb();
  }
  $(".lightbox-close").addEventListener("click", closeLightbox);
  $(".lightbox-prev").addEventListener("click", () => step(-1));
  $(".lightbox-next").addEventListener("click", () => step(1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  /* =========================================================
     FEATURE B — Shop + cart drawer
  ========================================================= */
  const products = [
    { id: "p1", name: "The Wildflower", tag: "Bestseller", price: 42, seed: "wf-shop1",
      desc: "Our signature just-picked posy of seasonal British blooms, gathered loose." },
    { id: "p2", name: "Sage & Stone", tag: "New", price: 38, seed: "wf-shop2",
      desc: "Calming greens, eucalyptus and chalky white ranunculus in a stoneware jug." },
    { id: "p3", name: "Dusk Romance", tag: "", price: 55, seed: "wf-shop3",
      desc: "Dusty-rose garden roses, chocolate cosmos and trailing amaranth." },
    { id: "p4", name: "Terracotta Sunset", tag: "", price: 48, seed: "wf-shop4",
      desc: "Warm dahlias, marigold and ochre grasses — a little bottled sunshine." },
    { id: "p5", name: "Letterbox Posy", tag: "Popular", price: 28, seed: "wf-shop5",
      desc: "A petite bunch that fits straight through the door. Free UK delivery." },
    { id: "p6", name: "Dried Everlasting", tag: "", price: 34, seed: "wf-shop6",
      desc: "Sun-dried strawflower, bunny tails and lavender that lasts for months." },
  ];

  const shopGrid = $("#shop-grid");
  products.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product reveal";
    card.innerHTML =
      '<div class="product-media">' +
      (p.tag ? '<span class="product-tag">' + p.tag + "</span>" : "") +
      '<img src="https://picsum.photos/seed/' + p.seed + '/500/500" alt="' +
      p.name + ' bouquet" loading="lazy" /></div>' +
      '<div class="product-body"><h3>' + p.name + "</h3>" +
      '<p class="desc">' + p.desc + "</p>" +
      '<div class="product-foot"><span class="price">' + fmt(p.price) + "</span>" +
      '<button class="btn btn-sage add-btn" data-id="' + p.id +
      '" aria-label="Add ' + p.name + ' to basket">Add to basket</button></div></div>';
    shopGrid.appendChild(card);
  });

  let cart = {}; // id -> qty

  $$(".add-btn").forEach((b) =>
    b.addEventListener("click", () => {
      addToCart(b.dataset.id);
      const p = products.find((x) => x.id === b.dataset.id);
      toast(p.name + " added to your basket");
    })
  );

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    openCart();
  }
  function changeQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    renderCart();
  }
  function removeItem(id) {
    delete cart[id];
    renderCart();
  }

  const cartDrawer = $("#cart-drawer");
  const cartItemsEl = $("#cart-items");
  const cartCountEls = $$(".cart-count");
  const cartTotalEl = $("#cart-total");
  const cartFoot = $("#cart-foot");

  function cartTotals() {
    let count = 0, total = 0;
    Object.keys(cart).forEach((id) => {
      const p = products.find((x) => x.id === id);
      count += cart[id];
      total += cart[id] * p.price;
    });
    return { count, total };
  }

  function renderCart() {
    const ids = Object.keys(cart);
    const { count, total } = cartTotals();
    cartCountEls.forEach((el) => {
      el.textContent = count;
      el.style.display = count ? "" : "none";
    });

    if (!ids.length) {
      cartItemsEl.innerHTML =
        '<div class="cart-empty">' +
        '<svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#8a9a7b" stroke-width="1.4" aria-hidden="true"><path d="M3 6h18l-2 12H5L3 6Z"/><path d="M8 6a4 4 0 0 1 8 0"/></svg>' +
        "<p>Your basket is empty.<br>Pick something lovely from the shop.</p></div>";
      cartFoot.style.display = "none";
      return;
    }
    cartFoot.style.display = "";
    cartItemsEl.innerHTML = ids
      .map((id) => {
        const p = products.find((x) => x.id === id);
        const q = cart[id];
        return (
          '<div class="cart-line">' +
          '<img src="https://picsum.photos/seed/' + p.seed + '/120/120" alt="" />' +
          "<div><div class=\"nm\">" + p.name + "</div>" +
          '<div class="pr">' + fmt(p.price) + " each</div>" +
          '<div class="qty"><button aria-label="Decrease quantity" data-dec="' + id + '">−</button>' +
          "<span>" + q + "</span>" +
          '<button aria-label="Increase quantity" data-inc="' + id + '">+</button></div>' +
          '<button class="remove" data-rm="' + id + '">Remove</button></div>' +
          '<div class="ln-total">' + fmt(p.price * q) + "</div>" +
          "</div>"
        );
      })
      .join("");

    cartTotalEl.textContent = fmt(total);

    $$("[data-inc]", cartItemsEl).forEach((b) => b.addEventListener("click", () => changeQty(b.dataset.inc, 1)));
    $$("[data-dec]", cartItemsEl).forEach((b) => b.addEventListener("click", () => changeQty(b.dataset.dec, -1)));
    $$("[data-rm]", cartItemsEl).forEach((b) => b.addEventListener("click", () => removeItem(b.dataset.rm)));
  }

  function openCart() {
    cartDrawer.classList.add("open");
    overlay.classList.add("show");
    cartDrawer.removeAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    cartDrawer.classList.remove("open");
    if (!mobileMenu.classList.contains("open")) overlay.classList.remove("show");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  $$(".cart-btn").forEach((b) => b.addEventListener("click", openCart));
  $("#cart-close").addEventListener("click", closeCart);

  // Checkout -> mock success
  $("#checkout-btn").addEventListener("click", () => {
    const { total } = cartTotals();
    cartItemsEl.innerHTML =
      '<div class="checkout-success">' +
      '<div class="tick"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#5f6f52" stroke-width="2.2" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg></div>' +
      "<h3>Order placed!</h3>" +
      "<p>Thank you. Your " + fmt(total) +
      " order is confirmed — we'll hand-tie it fresh and send a despatch email shortly.</p>" +
      '<p style="font-size:.78rem;color:var(--ink-soft)">This is a demo — no payment was taken.</p></div>';
    cartFoot.style.display = "none";
    cart = {};
    cartCountEls.forEach((el) => { el.textContent = "0"; el.style.display = "none"; });
  });

  renderCart();

  /* =========================================================
     FEATURE C — Delivery postcode checker
  ========================================================= */
  const covered = ["BA1", "BA2", "BA3", "BA15", "BS1", "BS2", "BS3", "BS8", "BS9", "BS31", "BS39", "SN13", "GL8"];
  const pcForm = $("#postcode-form");
  const pcInput = $("#postcode-input");
  const pcResult = $("#postcode-result");

  pcForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = pcInput.value.trim().toUpperCase().replace(/\s+/g, "");
    pcResult.className = "postcode-result show";
    if (!/^[A-Z]{1,2}\d[A-Z\d]?/.test(raw)) {
      pcResult.classList.add("no");
      pcResult.innerHTML = "✿ Hmm, that doesn't look like a UK postcode. Try e.g. BA1 5LR.";
      return;
    }
    // outward code = letters + first digit block
    const outward = (raw.match(/^[A-Z]{1,2}\d[A-Z\d]?/) || [""])[0];
    // normalise BA1 vs BA15 by checking longest match
    const hit = covered.find((c) => outward === c) ||
      covered.find((c) => raw.startsWith(c) && !/\d/.test(raw.charAt(c.length)));
    if (hit) {
      pcResult.classList.add("yes");
      pcResult.innerHTML = "❀ Wonderful — we deliver to " + hit + "! Order by 1pm for same-day in Bath.";
    } else {
      pcResult.classList.add("no");
      pcResult.innerHTML = "We're not in " + outward + " just yet — but nationwide letterbox flowers are available, or call us to arrange a courier.";
    }
  });

  /* =========================================================
     FEATURE D — Testimonials wall (with star ratings)
  ========================================================= */
  const testimonials = [
    { name: "Hannah W.", loc: "Widcombe, Bath", rating: 5, seed: "wf-t1",
      quote: "The most beautiful, scented bouquet I've ever received. It looked like it had been picked from an English garden that morning." },
    { name: "Marcus & Priya", loc: "Wedding, Prior Park", rating: 5, seed: "wf-t2",
      quote: "Our wedding flowers brought everyone to tears. Lottie understood our vision instantly and the meadow arch was unforgettable." },
    { name: "Eleanor T.", loc: "Bathwick", rating: 5, seed: "wf-t3",
      quote: "I have a weekly subscription now. Every Friday a little jar of joy arrives. The quality never dips." },
    { name: "James R.", loc: "Bristol", rating: 4, seed: "wf-t4",
      quote: "Ordered last-minute for an anniversary and they still managed same-day. Genuinely lovely, characterful flowers." },
    { name: "The Pump Room", loc: "Corporate client", rating: 5, seed: "wf-t5",
      quote: "Wildflower & Fern dress our events every month. Reliable, seasonal and always a talking point with guests." },
    { name: "Sofia L.", loc: "Combe Down", rating: 5, seed: "wf-t6",
      quote: "I did the autumn wreath workshop — relaxed, warm and I came away with something I was so proud of. Highly recommend." },
  ];
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const testiGrid = $("#testi-grid");
  testimonials.forEach((t) => {
    const el = document.createElement("article");
    el.className = "testi reveal";
    el.innerHTML =
      '<div class="stars" aria-label="' + t.rating + ' out of 5 stars">' + stars(t.rating) + "</div>" +
      "<blockquote>“" + t.quote + "”</blockquote>" +
      '<div class="who"><img src="https://picsum.photos/seed/' + t.seed + '/88/88" alt="" />' +
      "<div><div class=\"nm\">" + t.name + '</div><div class="loc">' + t.loc + "</div></div></div>";
    testiGrid.appendChild(el);
  });

  /* =========================================================
     FEATURE E — Newsletter
  ========================================================= */
  const newsForm = $("#news-form");
  const newsInput = $("#news-email");
  const newsErr = $("#news-error");
  const newsOk = $("#news-success");
  newsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = newsInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!valid) {
      newsErr.textContent = "Please enter a valid email address.";
      newsInput.focus();
      newsOk.classList.remove("show");
      return;
    }
    newsErr.textContent = "";
    newsOk.classList.add("show");
    newsForm.reset();
  });
  newsInput.addEventListener("input", () => { newsErr.textContent = ""; });

  /* ---------------------------------------------------------
     Contact form
  --------------------------------------------------------- */
  const contactForm = $("#contact-form");
  const contactOk = $("#contact-success");
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }
    const name = $("#c-name").value.trim().split(" ")[0] || "there";
    contactOk.textContent =
      "Thank you, " + name + "! Your enquiry is with our studio — we'll reply within one working day.";
    contactOk.classList.add("show");
    contactForm.reset();
    contactOk.focus();
  });

  /* ---------------------------------------------------------
     Toast helper
  --------------------------------------------------------- */
  let toastTimer;
  const toastEl = $("#toast");
  function toast(msg) {
    toastEl.querySelector("span").textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  $("#year").textContent = new Date().getFullYear();
})();
