// Wishlist functionality for LetMeGlowUp
// Handles: add/remove, localStorage, share, move to cart, counter, recently viewed

const WISHLIST_KEY = 'letmeglowup_wishlist';
const RECENTLY_VIEWED_KEY = 'letmeglowup_recently_viewed';
const CART_KEY = 'letmeglowup_cart';

function getWishlist() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}
function setWishlist(items) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}
function getRecentlyViewed() {
  return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
}
function setRecentlyViewed(items) {
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
}
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}
function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// Add/remove wishlist
function toggleWishlist(product) {
  let wishlist = getWishlist();
  const idx = wishlist.findIndex(p => p.id === product.id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push(product);
  }
  setWishlist(wishlist);
  updateWishlistCounter();
}

// Wishlist counter in header
function updateWishlistCounter() {
  const counter = document.getElementById('wishlist-counter');
  if (!counter) return;
  const count = getWishlist().length;
  counter.textContent = count > 0 ? count : '';
}

// Move to cart
function moveToCart(product) {
  let cart = getCart();
  cart.push(product);
  setCart(cart);
  toggleWishlist(product);
}

// Share wishlist
function shareWishlist() {
  const wishlist = getWishlist();
  if (wishlist.length === 0) return alert('Your wishlist is empty!');
  const url = `${window.location.origin}/wishlist.html?items=${encodeURIComponent(JSON.stringify(wishlist.map(p => p.id)))}`;
  navigator.clipboard.writeText(url);
  alert('Wishlist link copied!');
}

// Recently viewed
function addRecentlyViewed(product) {
  let viewed = getRecentlyViewed();
  viewed = viewed.filter(p => p.id !== product.id);
  viewed.unshift(product);
  if (viewed.length > 8) viewed = viewed.slice(0, 8);
  setRecentlyViewed(viewed);
}

// Render wishlist page
async function renderWishlistPage() {
  const grid = document.getElementById('wishlist-grid');
  if (!grid) return;
  const res = await fetch('assets/data/products.json');
  const products = await res.json();
  const wishlist = getWishlist();
  if (wishlist.length === 0) {
    grid.innerHTML = '<p>Your wishlist is empty.</p>';
    return;
  }
  grid.innerHTML = wishlist.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return '';
    return `
      <div class="product-card bg-white rounded-xl shadow p-4 flex flex-col">
        <div class="product-image mb-4">
          <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-contain rounded-lg" />
        </div>
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-semibold text-lg mb-1">${product.title}</h3>
            <div class="text-sm text-gray-500 mb-2">${product.brand || ''}</div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-pop-pink font-bold text-xl">$${product.price.toFixed(2)}</span>
              ${product.oldPrice ? `<span class='line-through text-gray-400'>$${product.oldPrice.toFixed(2)}</span>` : ''}
              ${product.discount ? `<span class='text-green-600 font-semibold'>${product.discount}% off</span>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <button class="btn btn--icon wishlist-btn" data-id="${product.id}" title="Remove from Wishlist" onclick="toggleWishlist(${JSON.stringify(product)})"><i class="fa fa-heart"></i></button>
            <button class="btn btn--primary" onclick='moveToCart(${JSON.stringify(product)})'>Move to Cart</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render recently viewed
function renderRecentlyViewed() {
  const container = document.getElementById('recently-viewed');
  if (!container) return;
  const viewed = getRecentlyViewed();
  if (viewed.length === 0) {
    container.innerHTML = '<p>No recently viewed items.</p>';
    return;
  }
  container.innerHTML = viewed.map(product => `
    <div class="product-card bg-white rounded-xl shadow p-2 flex flex-col w-32">
      <img src="${product.image}" alt="${product.title}" class="w-full h-24 object-contain rounded-lg mb-2" />
      <div class="text-xs font-semibold mb-1">${product.title}</div>
      <a href="product.html?id=${product.id}" class="btn btn--primary btn--sm">View</a>
    </div>
  `).join('');
}

// On page load
if (window.location.pathname.includes('wishlist.html')) {
  renderWishlistPage();
}
