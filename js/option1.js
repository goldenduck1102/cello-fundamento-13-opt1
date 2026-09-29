const container = document.querySelector('#tiers');
window.EVENT_TIERS.forEach(tier => {
  const item = document.createElement('article');
  item.className = 'tier';
  item.style.setProperty('--tier', tier.color);
  const name = document.createElement('h3'); name.textContent = tier.name;
  const price = document.createElement('p'); price.textContent = new Intl.NumberFormat('vi-VN').format(tier.price) + ' ₫';
  const note = document.createElement('small'); note.textContent = tier.invitation ? 'Tầng 1 · Vé mời, không mở bán' : tier.desc;
  item.append(name,price,note); container.append(item);
});
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  document.body.classList.add('motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: .06});
  document.querySelectorAll('.reveal').forEach(section => observer.observe(section));
}
document.querySelector('.seating').addEventListener('toggle', event => {
  if (event.target.open) requestAnimationFrame(() => { const map=document.querySelector('.map-scroll'); map.scrollLeft=Math.max(0,(map.scrollWidth-map.clientWidth)/2); });
});
