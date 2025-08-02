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
        // Loading skeleton
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8';
        grid.innerHTML = Array(4).fill('').map(() => `
            <div class="product-card animate-pulse flex flex-col items-center text-center mx-auto" style="min-height:340px;">
                <div class="bg-gray-200 rounded mb-2" style="width:150px;height:150px;"></div>
                <div class="h-4 w-3/4 bg-gray-200 rounded mb-1"></div>
                <div class="h-3 w-1/2 bg-gray-100 rounded mb-1"></div>
                <div class="h-3 w-1/3 bg-gray-100 rounded mb-2"></div>
                <div class="h-6 w-full bg-gray-100 rounded"></div>
            </div>
        `).join('');
        let products = [];
        try {
            const res = await fetch('assets/data/products.json');
            if (!res.ok) throw new Error('Failed to load products');
            products = await res.json();
        } catch (e) {
            grid.innerHTML = `<p class='text-center text-red-500 py-8'>Error loading products. Please try again later.</p>`;
            return;
        }
        let wishlist = [];
        try {
            wishlist = getWishlist();
        } catch (e) {
            grid.innerHTML = `<p class='text-center text-red-500 py-8'>Error loading wishlist. Please clear your browser storage and try again.</p>`;
            return;
        }
        if (wishlist.length === 0) {
            grid.innerHTML = '<p class="text-center text-gray-500 py-8">Your wishlist is empty.</p>';
            grid.className = '';
            return;
        }
        grid.innerHTML = wishlist.map(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return '';
            return `
                <div class="product-card group">
                    <button class="btn btn--icon wishlist-btn" data-id="${product.id}" title="Remove from Wishlist" onclick="toggleWishlist(${JSON.stringify(product)})"><i class="fa fa-heart text-pop-pink"></i></button>
                    <img src="${product.image}" alt="${product.title}" />
                    <h3 class="line-clamp-2">${product.title}</h3>
                    <div class="brand">${product.brand || ''}</div>
                    <div class="price-row">
                        <span class="price">$${product.price.toFixed(2)}</span>
                        ${product.oldPrice ? `<span class='old-price'>$${product.oldPrice.toFixed(2)}</span>` : ''}
                        ${product.discount ? `<span class='discount'>${product.discount}% off</span>` : ''}
                    </div>
                    <button class="btn btn--primary btn--sm" onclick='moveToCart(${JSON.stringify(product)})'>Move to Cart</button>
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
    <div class="product-card" style="min-width:140px;max-width:160px;padding:0.75rem 0.5rem;min-height:220px;">
      <img src="${product.image}" alt="${product.title}" style="width:100px;height:100px;object-fit:contain;margin-bottom:0.5rem;" />
      <div class="line-clamp-2 mb-1" style="font-size:0.95rem;font-weight:600;">${product.title}</div>
      <a href="product.html?id=${product.id}" class="btn btn--primary btn--sm">View</a>
    </div>
  `).join('');
}

// On page load
if (window.location.pathname.includes('wishlist.html')) {
  renderWishlistPage();
}
