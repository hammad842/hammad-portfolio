/* No framework, build tools, remote fonts, tracking, or network requests required. */
(() => {
  const root = document.documentElement;
  const viewport = document.querySelector('.viewport');
  const fit = () => root.style.setProperty('--scale', viewport.clientWidth / 1920);
  fit();
  new ResizeObserver(fit).observe(viewport);
  const queryTheme = new URLSearchParams(location.search).get('theme');
  if (queryTheme === 'black' || queryTheme === 'white') root.dataset.theme = queryTheme;
  const dialog = document.querySelector('#dialog');
  const content = document.querySelector('#dialog-content');
  const show = (html, kind = 'preview') => { dialog.dataset.kind = kind; content.innerHTML = html; if (!dialog.open) dialog.showModal(); };
  const scrollToSection = id => {
    dialog.close();
    const target = document.getElementById(id);
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth' });
  };
  const productNames = {28:'Carhartt WIP Landon Shorts',56:'Carhartt WIP T-Shirt Warm Views',48:'Carhartt WIP Base T-shirt',68:'Carhartt WIP Nelson Shorts'};
  const productPrices = {28:'65,90 €',56:'37,90 €',48:'29,90 €',68:'79,90 €'};
  const showProduct = id => show(`<img src="assets/photo-${id}.webp" alt="${productNames[id]}"><h2>${productNames[id]}</h2><p>${productPrices[id]}</p><p class="muted">Product design preview. Sizes, inventory and checkout are not connected.</p>`);
  function act(element) {
    const action = element.dataset.action;
    if (action === 'menu') {
      show(`<h2>Carhartt</h2><nav class="dialog-nav" aria-label="Main menu"><button data-section="products">New arrivals</button><button data-section="footwear">Footwear</button><button data-section="collection">Lookbook</button><button data-section="footer">About & contact</button></nav><label for="theme-select">Website version</label><select id="theme-select"><option value="black">Black</option><option value="white">White</option></select>`, 'menu');
      content.querySelector('#theme-select').value = root.dataset.theme;
      content.querySelector('#theme-select').onchange = e => {
        const update = () => {root.dataset.theme = e.target.value;};
        if (window.CarharttMotion) window.CarharttMotion.switchTheme(update); else update();
        const url = new URL(location.href); url.searchParams.set('theme', e.target.value); if (location.protocol !== 'file:') history.replaceState(null, '', url);
      };
      content.querySelectorAll('[data-section]').forEach(button => button.onclick = () => scrollToSection(button.dataset.section));
    } else if (action === 'shop') scrollToSection('products');
    else if (action === 'lookbook') scrollToSection('collection');
    else if (action === 'keen' || action === 'altra') show(`<h2>${action === 'keen' ? 'Keen' : 'Altra Footwear'}</h2><img src="assets/photo-${action === 'keen' ? 44 : 40}.webp" alt="${action === 'keen' ? 'Keen' : 'Altra'} footwear"><p class="muted">Collection design preview. Product catalogue is not connected.</p>`);
    else if (action === 'product') {
      let id = Number(element.dataset.product);
      if (!productNames[id]) { const index = Number(element.id.replace('copy-', '')); id = index <= 3 ? 28 : index <= 5 ? 56 : index <= 7 ? 48 : 68; }
      showProduct(id);
    } else if (action === 'bag') show('<h2>Your bag</h2><p>Your shopping bag is empty.</p><p class="muted">Checkout is not connected in this front-end preview.</p>');
    else if (action === 'account') show('<h2>My account</h2><p class="muted">Account services are not connected in this front-end preview.</p>');
    else if (action === 'newsletter') {
      show('<h2>Subscribe to our Newsletter</h2><form id="newsletter-form"><label for="email">Email address</label><input id="email" type="email" autocomplete="email" required><button class="dialog-action">Preview signup →</button></form><p class="muted">Preview only. Your email will not be transmitted or stored.</p>');
      content.querySelector('#newsletter-form').onsubmit = e => {e.preventDefault();show('<h2>Thank you</h2><p>Signup preview complete. No email was sent or stored.</p>');};
    } else if (action === 'studio') show('<h2>Onside Studio</h2><p>Website concept and design by Onside Studio.</p>');
    else if (action === 'social') show('<h2>Follow Carhartt</h2><p class="muted">Add your approved social profile URLs in app.js before publishing.</p>');
    else show('<h2>Page preview</h2><p class="muted">This destination page was not included in the supplied homepage designs.</p>');
  }
  document.querySelectorAll('[data-action]').forEach(element => {
    element.addEventListener('click', () => act(element));
    if (element.tagName !== 'BUTTON') element.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();act(element);} });
  });
  dialog.addEventListener('click', e => { if (e.target === dialog) { const box = dialog.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close(); } });
})();
