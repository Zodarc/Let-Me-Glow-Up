// Product Detail Page Logic for LetMeGlowUp
// Loads product data, handles gallery, wishlist, reviews, price history, sharing, and related products

const PRODUCTS_URL = 'assets/data/products.json';
const REVIEWS_URL = 'assets/data/reviews.json'; // Optional: for customer reviews

let product = null;
let allProducts = [];

// Utility: Get product ID from URL (e.g., ?id=glow-serum)
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Utility: Fetch all products
async function fetchProducts() {
  const res = await fetch(PRODUCTS_URL);
  return res.json();
}

// Utility: Fetch reviews (optional)
async function fetchReviews(productId) {
  try {
    const res = await fetch(REVIEWS_URL);
    const all = await res.json();
    return all[productId] || [];
  } catch {
    return [];
  }
}

// Render product gallery
function renderGallery(images) {
  const mainImg = document.getElementById('main-product-image');
  const thumbs = document.getElementById('product-thumbnails');
  if (!images || !images.length) return;
  mainImg.src = images[0];
  thumbs.innerHTML = images.map((img, i) => `<img src="${img}" class="w-16 h-16 object-cover rounded cursor-pointer border-2 ${i===0?'border-pop-pink':'border-transparent'}" data-idx="${i}" />`).join('');
  thumbs.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', e => {
      mainImg.src = img.src;
      thumbs.querySelectorAll('img').forEach(t => t.classList.remove('border-pop-pink'));
      img.classList.add('border-pop-pink');
    });
  });
}

// Render product info
function renderProductInfo(p) {
  document.getElementById('product-title').textContent = p.title;
  document.getElementById('product-brand').textContent = p.brand || '';
  document.getElementById('product-price').textContent = `$${p.price.toFixed(2)}`;
  document.getElementById('product-old-price').textContent = p.oldPrice ? `$${p.oldPrice.toFixed(2)}` : '';
  document.getElementById('product-discount').textContent = p.discount ? `-${p.discount}%` : '';
  document.getElementById('product-rating').innerHTML = renderStars(p.rating);
  document.getElementById('product-reviews').textContent = `(${p.reviews || 0} reviews)`;
  document.getElementById('product-availability').textContent = p.available ? 'In Stock' : 'Out of Stock';
  document.getElementById('product-availability').className = p.available ? 'mb-2 text-green-600 font-semibold' : 'mb-2 text-red-600 font-semibold';
  document.getElementById('product-shipping').textContent = p.shipping || '';
  document.getElementById('buy-now-btn').href = p.affiliateLink;
  // Size/shade selectors
  const sizeSel = document.getElementById('product-size');
  if (p.sizes && p.sizes.length) {
    sizeSel.innerHTML = p.sizes.map(s => `<option value="${s}">${s}</option>`).join('');
    sizeSel.classList.remove('hidden');
  }
  const shadeSel = document.getElementById('product-shade');
  if (p.shades && p.shades.length) {
    shadeSel.innerHTML = p.shades.map(s => `<option value="${s}">${s}</option>`).join('');
    shadeSel.classList.remove('hidden');
  }
  // Description & ingredients
  document.getElementById('product-description').innerHTML = `<h3 class='font-semibold mb-1'>Description</h3><p>${p.description || ''}</p>`;
  if (p.ingredients) {
    document.getElementById('product-ingredients').innerHTML = `<h3 class='font-semibold mb-1'>Ingredients</h3><ul class='list-disc ml-6'>${p.ingredients.map(i=>`<li>${i}</li>`).join('')}</ul>`;
  }
}

// Render stars
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) html += '<i class="fa fa-star"></i>';
    else if (i === full && half) html += '<i class="fa fa-star-half-alt"></i>';
    else html += '<i class="fa fa-star-o"></i>';
  }
  return html;
}

// Wishlist logic
function updateWishlistBtn(id) {
  const btn = document.getElementById('wishlist-btn');
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const inList = wishlist.some(item => item.id === id);
  btn.classList.toggle('text-pop-pink', inList);
  btn.title = inList ? 'Remove from Wishlist' : 'Add to Wishlist';
}
function toggleWishlist(p) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const idx = wishlist.findIndex(item => item.id === p.id);
  if (idx > -1) wishlist.splice(idx, 1);
  else wishlist.push(p);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistBtn(p.id);
}

// Share buttons
function setupShareButtons(p) {
  document.getElementById('share-facebook').onclick = () => window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`);
  document.getElementById('share-twitter').onclick = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(p.title)}`);
  document.getElementById('share-pinterest').onclick = () => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(location.href)}&media=${encodeURIComponent(p.image)}&description=${encodeURIComponent(p.title)}`);
  document.getElementById('share-link').onclick = () => {navigator.clipboard.writeText(location.href); alert('Link copied!');};
}

// Render customer reviews
function renderReviews(reviews) {
  const container = document.getElementById('customer-reviews');
  if (!reviews.length) {
    container.innerHTML = '<div class="text-gray-400">No reviews yet.</div>';
    return;
  }
  container.innerHTML = reviews.map(r => `
    <div class="mb-4 border-b pb-4">
      <div class="flex items-center gap-2 mb-1">
        <img src="${r.avatar || 'assets/images/default-avatar.png'}" class="w-8 h-8 rounded-full"/>
        <span class="font-semibold">${r.name}</span>
        <span class="text-yellow-400">${renderStars(r.rating)}</span>
      </div>
      <div class="text-sm mb-1">${r.text}</div>
      ${r.photos && r.photos.length ? `<div class='flex gap-2 mt-2'>${r.photos.map(p=>`<img src='${p}' class='w-16 h-16 object-cover rounded'/>`).join('')}</div>` : ''}
    </div>
  `).join('');
}

// Render related products
function renderRelated(products, currentId) {
  const container = document.getElementById('related-products-carousel');
  const related = products.filter(p => p.id !== currentId).slice(0, 8);
  container.innerHTML = related.map(p => `
    <a href="product.html?id=${p.id}" class="block w-40 min-w-40 bg-white rounded shadow p-2 hover:shadow-lg transition">
      <img src="${p.image}" alt="${p.title}" class="w-full h-24 object-cover rounded mb-2"/>
      <div class="font-semibold text-sm mb-1">${p.title}</div>
      <div class="text-pop-pink font-bold">$${p.price.toFixed(2)}</div>
    </a>
  `).join('');
}

// Render price history (dummy data for now)
function renderPriceHistory(prices) {
  const ctx = document.getElementById('price-history-graph').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: prices.map(p => p.date),
      datasets: [{
        label: 'Price',
        data: prices.map(p => p.price),
        borderColor: '#ff69b4',
        backgroundColor: 'rgba(255,105,180,0.1)',
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { beginAtZero: false } },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Main init
async function initProduct() {
  allProducts = await fetchProducts();
  const id = getProductId();
  product = allProducts.find(p => p.id === id);
  if (!product) {
    document.body.innerHTML = '<div class="container mx-auto p-8 text-center text-pop-pink font-bold text-2xl">Product not found.</div>';
    return;
  }
  // Gallery: support product.images (array) or fallback to [image]
  renderGallery(product.images && product.images.length ? product.images : [product.image]);
  renderProductInfo(product);
  updateWishlistBtn(product.id);
  document.getElementById('wishlist-btn').onclick = () => toggleWishlist(product);
  setupShareButtons(product);
  // Reviews
  const reviews = await fetchReviews(product.id);
  renderReviews(reviews);
  // Related
  renderRelated(allProducts, product.id);
  // Price history (dummy data if not present)
  renderPriceHistory(product.priceHistory || [
    {date:'2025-07-01',price:product.oldPrice||product.price},
    {date:'2025-07-15',price:product.price}
  ]);
}

document.addEventListener('DOMContentLoaded', initProduct);
