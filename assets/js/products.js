// Fetch and render products from JSON
async function loadProducts(category = 'All') {
  const grid = document.getElementById('products-grid');
  // Show skeletons while loading
  grid.innerHTML = Array(4).fill('').map(() => `
    <div class="product-card skeleton">
      <div class="product-card__image skeleton-box"></div>
      <div class="product-card__content">
        <div class="skeleton-box w-2/3 h-4 mb-2"></div>
        <div class="skeleton-box w-1/2 h-4 mb-2"></div>
        <div class="skeleton-box w-1/3 h-4 mb-2"></div>
        <div class="skeleton-box w-full h-8 mt-4"></div>
      </div>
    </div>
  `).join('');
  const res = await fetch('assets/data/products.json');
  const products = await res.json();
  let filtered = category === 'All' ? products : products.filter(p => p.category === category);
  grid.innerHTML = filtered.map(product => {
    const discounted = product.discount && product.oldPrice > product.price;
    return `
    <div class="product-card group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-soft-beige transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      ${discounted ? `<span class="absolute top-4 left-4 bg-pop-pink text-white text-xs font-bold px-3 py-1 rounded-full z-10">-${product.discount}%</span>` : ''}
      <button class="wishlist-btn absolute top-4 right-4 bg-white/80 rounded-full p-2 shadow hover:bg-pop-pink hover:text-white transition z-10" aria-label="Add to Wishlist" data-id="${product.id}">
        <i class="icon-heart"></i>
      </button>
      <div class="overflow-hidden">
        <img src="${product.image}" alt="${product.title}" class="product-card__image w-full h-48 object-cover object-center group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div class="p-5 flex flex-col gap-2 product-card__content">
        <span class="text-xs text-glossy-brown font-medium">${product.category}</span>
        <h3 class="product-card__title">${product.title}</h3>
        <div class="flex items-center gap-1 mb-1 rating__stars">
          ${renderStars(product.rating)}
          <span class="ml-2 text-xs text-gray-500">(${product.reviews} reviews)</span>
        </div>
        <div class="product-card__price flex items-center gap-2 mb-2">
          <span class="product-card__price-current">$${product.price.toFixed(2)}</span>
          ${discounted ? `<span class="product-card__price-original">$${product.oldPrice.toFixed(2)}</span>` : ''}
        </div>
        <div class="flex gap-2 mt-2">
          <a href="${product.affiliateLink}?ref=letmeglowup" target="_blank" rel="noopener" class="flex-1 px-3 py-2 rounded-full bg-pop-pink text-white font-medium hover:bg-glossy-brown transition affiliate-btn" data-id="${product.id}">Buy Now</a>
          <button class="flex-1 px-3 py-2 rounded-full bg-cream-white text-pop-pink font-medium border border-pop-pink hover:bg-pop-pink hover:text-white transition quick-view-btn" data-id="${product.id}">Quick View</button>
        </div>
      </div>
    </div>
    `;
  }).join('');
  setupWishlistButtons();
  setupAffiliateTracking();
}

function renderStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars += '<i class="icon-star text-pop-pink"></i>';
    else if (rating >= i - 0.5) stars += '<i class="icon-star-half text-pop-pink"></i>';
    else stars += '<i class="icon-star text-soft-beige"></i>';
  }
  return stars;
}

// Wishlist toggle functionality
function setupWishlistButtons() {
  const buttons = document.querySelectorAll('.wishlist-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      this.classList.toggle('active');
      const icon = this.querySelector('i');
      if (this.classList.contains('active')) {
        icon.classList.add('text-pop-pink');
        icon.classList.remove('text-gray-400');
      } else {
        icon.classList.remove('text-pop-pink');
        icon.classList.add('text-gray-400');
      }
    });
  });
}

// Affiliate link tracking
function setupAffiliateTracking() {
  const links = document.querySelectorAll('.affiliate-btn');
  links.forEach(link => {
    link.addEventListener('click', function() {
      // Example: send event to analytics
      if (window.gtag) {
        window.gtag('event', 'affiliate_click', {
          event_category: 'Affiliate',
          event_label: this.href,
        });
      }
    });
  });
}

// Category tab click
function setupCategoryTabs() {
  const tabs = document.querySelectorAll('.category-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active', 'bg-pop-pink', 'text-white'));
      this.classList.add('active', 'bg-pop-pink', 'text-white');
      loadProducts(this.textContent.trim());
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupCategoryTabs();
});
