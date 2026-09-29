(() => {
  "use strict";

  const CFG = window.SITE_CONFIG;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const vnd = (n) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";

  /* ---------------- Tracking (Meta Pixel / GA4) ---------------- */
  const track = (() => {
    const { metaPixelId, ga4Id } = CFG.tracking || {};
    if (metaPixelId) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq("init", metaPixelId);
      window.fbq("track", "PageView");
      window.fbq("track", "ViewContent", { content_name: "CF13 Mischa Maisky" });
    }
    if (ga4Id) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + ga4Id;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", ga4Id);
    }
    return (event, params = {}) => {
      if (window.fbq) {
        const std = { InitiateCheckout: 1, Lead: 1, Contact: 1, AddToCart: 1 };
        window.fbq(std[event] ? "track" : "trackCustom", event, params);
      }
      if (window.gtag) window.gtag("event", event, params);
    };
  })();

  // Keep UTM params for the whole visit so orders can be attributed to ad campaigns.
  const utm = (() => {
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
    const params = new URLSearchParams(location.search);
    let stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("cf13_utm") || "{}"); } catch (_) {}
    keys.forEach((k) => { if (params.get(k)) stored[k] = params.get(k); });
    try { sessionStorage.setItem("cf13_utm", JSON.stringify(stored)); } catch (_) {}
    return stored;
  })();

  /* ---------------- Contact links ---------------- */
  const { contact } = CFG;
  $$('[data-contact="tel"]').forEach((a) => { a.href = "tel:" + contact.hotline; });
  $$('[data-contact="zalo"]').forEach((a) => { a.href = contact.zalo; });
  $$("[data-contact-label]").forEach((a) => { a.textContent = contact.hotlineLabel; });
  if (contact.email) {
    $$('[data-contact="email"]').forEach((a) => { a.href = "mailto:" + contact.email; a.textContent = contact.email; });
    $$("[data-contact-email-wrap]").forEach((el) => { el.hidden = false; });
  }
  $$("[data-track]").forEach((el) =>
    el.addEventListener("click", () => {
      const name = el.dataset.track;
      track(name === "call" || name === "zalo" ? "Contact" : "cta_click", { placement: name });
    })
  );

  /* ---------------- Nav + sticky CTA ---------------- */
  const nav = $("#nav");
  const sticky = $("#stickyCta");
  const hero = $(".hero");
  const tickets = $("#tickets");
  let heroVisible = true;
  let ticketsVisible = false;
  const syncSticky = () => sticky.classList.toggle("is-visible", !heroVisible && !ticketsVisible);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; syncSticky(); }, { threshold: 0.15 }).observe(hero);
  new IntersectionObserver(([e]) => { ticketsVisible = e.isIntersecting; syncSticky(); }, { threshold: 0.05 }).observe(tickets);
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Reveal on scroll ---------------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (el.closest(".hero") ? i * 90 : 0) + "ms";
    io.observe(el);
  });

  /* ---------------- Countdown ---------------- */
  const start = new Date(CFG.eventStart).getTime();
  const cd = Object.fromEntries($$("[data-cd]").map((el) => [el.dataset.cd, el]));
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const diff = Math.max(0, start - Date.now());
    const s = Math.floor(diff / 1000);
    cd.d.textContent = pad(Math.floor(s / 86400));
    cd.h.textContent = pad(Math.floor((s % 86400) / 3600));
    cd.m.textContent = pad(Math.floor((s % 3600) / 60));
    cd.s.textContent = pad(s % 60);
    if (diff === 0) clearInterval(timer);
  };
  const timer = setInterval(tick, 1000);
  tick();

  /* ---------------- Journey carousel ---------------- */
  const journeyTrack = $("#journeyTrack");
  $$("[data-scroll]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const card = journeyTrack.querySelector(".season");
      const step = card ? card.getBoundingClientRect().width + 20 : 300;
      journeyTrack.scrollBy({ left: step * Number(btn.dataset.scroll) * 2, behavior: "smooth" });
    })
  );

  /* ---------------- Tiers + seat map ---------------- */
  const tiers = CFG.tiers;
  const tierList = $("#tierList");
  const firstAvailable = tiers.find((t) => !t.soldOut);
  tierList.innerHTML = tiers
    .map(
      (t) => `
      <label class="tier${t.soldOut ? " is-soldout" : ""}" data-tier="${t.id}">
        <input type="radio" name="tier" value="${t.id}" ${t.soldOut ? "disabled" : ""} ${t === firstAvailable ? "checked" : ""} />
        <span class="tier__dot" style="background:${t.color}"></span>
        <span><span class="tier__name">${t.name}</span><span class="tier__area">${t.area}</span></span>
        <span class="tier__price">${t.invitation ? "Vé mời · " + vnd(t.price) : t.soldOut ? "Hết vé" : vnd(t.price)}</span>
      </label>`
    )
    .join("");

  $("#legend").innerHTML = tiers.map((t) => `<li><i style="background:${t.color}"></i>${t.name}</li>`).join("");

  const svg = $("#seatmap");
  const NS = 'http://www.w3.org/2000/svg';
  svg.replaceChildren();
  svg.setAttribute('viewBox','0 0 720 1080');
  const el = (tag, attrs, text) => {const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;return n;};
  let y=32, floor=0;
  window.EVENT_SEAT_ROWS.forEach(row=>{
    if(row.floor!==floor){floor=row.floor;svg.append(el('text',{x:360,y,'text-anchor':'middle',fill:'currentColor'},'TẦNG '+floor));y+=35;}
    svg.append(el('text',{x:10,y:y+4,fill:'currentColor','font-size':12},row.label));
    row.cells.forEach((number,col)=>{
      if(!number)return;
      const r=row.label;
      const id=floor===2?(['A','B'].includes(r)&&number>=9?'upper':['AA','BB','CC','A','B','C','D'].includes(r)?'standard':'economy'):['A','B','C','D','E','F','G'].includes(r)?'vvip':['H','I'].includes(r)?'locked':['T','U'].includes(r)?'premium2':r==='K'||(['L','M'].includes(r)&&number>=13)||(['N','P'].includes(r)&&number>=11)?'vip':'premium1';
      const tier=tiers.find(t=>t.id===id);
      const g=el('g',{'data-tier':id,class:'zone'+(!tier||tier.invitation?' is-soldout':'')});
      g.append(el('title',{},'Tầng '+floor+' · '+r+number+' · '+(tier?tier.name+' · '+vnd(tier.price):'Ghế khóa')));
      g.append(el('rect',{x:40+col*20,y:y-9,width:16,height:17,rx:3,fill:tier?tier.color:'#686868'}));
      g.append(el('text',{x:48+col*20,y:y+3,'text-anchor':'middle','font-size':8,fill:'#111','pointer-events':'none'},String(number)));
      svg.append(g);
    });y+=27;
  });

  const qty = $("#qty");
  qty.max = CFG.maxTicketsPerOrder;
  const selectedTier = () => tiers.find((t) => t.id === ($('input[name="tier"]:checked') || {}).value);

  const updateSummary = () => {
    const t = selectedTier();
    const q = clampQty();
    $$("#seatmap .zone").forEach((z) => z.classList.toggle("is-active", !!t && z.dataset.tier === t.id));
    svg.classList.toggle("has-active", !!t);
    $("#sumLine").textContent = t ? `${q} × ${t.name} · ${vnd(t.price)}` : "Chưa chọn hạng vé";
    $("#sumTotal").textContent = vnd(t ? t.price * q : 0);
  };
  const clampQty = () => {
    let q = parseInt(qty.value, 10);
    if (!Number.isFinite(q) || q < 1) q = 1;
    if (q > CFG.maxTicketsPerOrder) q = CFG.maxTicketsPerOrder;
    return q;
  };

  let checkoutTracked = false;
  const onTierPicked = () => {
    updateSummary();
    if (!checkoutTracked) { checkoutTracked = true; track("InitiateCheckout", { content_category: "ticket" }); }
  };
  tierList.addEventListener("change", onTierPicked);
  svg.addEventListener("click", (e) => {
    const zone = e.target.closest(".zone");
    if (!zone || zone.classList.contains("is-soldout")) return;
    const input = $(`input[name="tier"][value="${zone.dataset.tier}"]`);
    input.checked = true;
    onTierPicked();
    if (matchMedia("(max-width: 1024px)").matches) input.closest(".tier").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $$("[data-qty]").forEach((b) => b.addEventListener("click", () => { qty.value = clampQty() + Number(b.dataset.qty); qty.value = clampQty(); updateSummary(); }));
  qty.addEventListener("input", updateSummary);
  qty.addEventListener("blur", () => { qty.value = clampQty(); updateSummary(); });
  updateSummary();

  /* Preview only: no personal data, order submission or ticket issuance. */
  const form = $("#orderForm");
  const modal = $("#resultModal");
  form.addEventListener('submit', event => {
    event.preventDefault();
    const tier = selectedTier();
    if (!tier || tier.invitation) return;
    $("#modalTitle").textContent = 'Lựa chọn thử của bạn';
    $("#modalText").textContent = 'Chưa giữ ghế, chưa tạo đơn và chưa thu tiền.';
    $("#modalSummary").textContent = `${clampQty()} × ${tier.name} — ${vnd(tier.price * clampQty())}. Thuế/phí chưa được xác nhận.`;
    $("#modalActions").replaceChildren();
    const close = document.createElement('button');
    close.className = 'btn btn--gold';
    close.textContent = 'Quay lại';
    close.onclick = () => modal.close();
    $("#modalActions").append(close);
    modal.showModal();
  });
})();
