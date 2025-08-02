// Fetch and render products from JSON
async function loadProducts(category = 'All') {
  const res = await fetch('assets/data/products.json');
  const products = await res.json();
  const grid = document.getElementById('products-grid');
  let filtered = category === 'All' ? products : products.filter(p => p.category === category);
  grid.innerHTML = filtered.map(product => `
    <div class="product-card group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-soft-beige transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      <span class="absolute top-4 left-4 bg-pop-pink text-white text-xs font-bold px-3 py-1 rounded-full z-10">-${product.discount}%</span>
      <button class="absolute top-4 right-4 bg-white/80 rounded-full p-2 shadow hover:bg-pop-pink hover:text-white transition z-10" aria-label="Add to Wishlist">
        <i class="icon-heart"></i>
      </button>
      <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover object-center group-hover:scale-105 transition duration-300" />
      <div class="p-5 flex flex-col gap-2">
        <span class="text-xs text-glossy-brown font-medium">${product.category}</span>
        <h3 class="text-lg font-semibold text-deep-black">${product.title}</h3>
        <div class="flex items-center gap-1 mb-1">
          ${renderStars(product.rating)}
          <span class="ml-2 text-xs text-gray-500">(${product.reviews} reviews)</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-pop-pink font-bold text-lg">$${product.price.toFixed(2)}</span>
          <span class="text-gray-400 line-through">$${product.oldPrice.toFixed(2)}</span>
        </div>
        <div class="flex gap-2 mt-2">
          <button class="flex-1 px-3 py-2 rounded-full bg-cream-white text-pop-pink font-medium border border-pop-pink hover:bg-pop-pink hover:text-white transition">Add to Wishlist</button>
          <button class="flex-1 px-3 py-2 rounded-full bg-pop-pink text-white font-medium hover:bg-glossy-brown transition">View Details</button>
        </div>
      </div>
    </div>
  `).join('');
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
