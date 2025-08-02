// Shop Page Dynamic Logic
// Loads products, handles filters, sorting, pagination, and recently viewed

const PRODUCTS_URL = 'assets/data/products.json';
const PRODUCTS_PER_PAGE = 12;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let currentSort = 'featured';
let currentFilters = {
  priceMin: '',
  priceMax: '',
  brand: '',
  category: '',
  rating: '',
  skinType: '',
  concerns: []
};

// Utility: Fetch products JSON
async function fetchProducts() {
  const res = await fetch(PRODUCTS_URL);
  return res.json();
}

// Utility: Render product cards
function renderProducts(products) {
  const grid = document.getElementById('shop-products-grid');
  grid.innerHTML = '';
  if (!products.length) {
    grid.innerHTML = '<div class="col-span-full text-center text-pop-pink font-semibold">No products found.</div>';
    document.getElementById('product-count').textContent = 0;
    return;
  }
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card bg-white rounded-xl shadow p-4 flex flex-col cursor-pointer group';
    card.innerHTML = `
      <a href="product.html?id=${product.id}" class="block focus:outline-none">
        <div class="relative mb-3">
          <img src="${product.image}" alt="${product.title}" class="w-full h-40 object-cover rounded-lg group-hover:opacity-90 transition"/>
          <button class="wishlist-btn absolute top-2 right-2 text-pop-pink bg-white rounded-full p-2 shadow" data-id="${product.id}" title="Add to Wishlist">
            <i class="fa${isInWishlist(product.id) ? 's' : 'r'} fa-heart"></i>
          </button>
        </div>
        <div class="flex-1 flex flex-col">
          <h3 class="font-semibold text-lg mb-1">${product.title}</h3>
          <div class="text-sm text-gray-500 mb-1">${product.brand ? product.brand : ''}</div>
          <div class="flex items-center mb-2">
            <span class="text-pop-pink font-bold text-lg mr-2">$${product.price.toFixed(2)}</span>
            <span class="text-yellow-400">${renderStars(product.rating)}</span>
            <span class="ml-1 text-xs text-gray-400">(${product.reviews})</span>
          </div>
          <span class="btn btn--primary w-full mt-auto">View Details</span>
        </div>
      </a>
    `;
    // Prevent wishlist button click from triggering link
    card.querySelector('.wishlist-btn').addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      toggleWishlist(product.id);
      renderShop();
    });
    grid.appendChild(card);
  });
  document.getElementById('product-count').textContent = products.length;
}

// Utility: Render stars for rating
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

// Utility: Wishlist check
function isInWishlist(id) {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  return wishlist.some(item => item.id === id);
}

// Utility: Apply filters
function applyFilters() {
  filteredProducts = allProducts.filter(product => {
    // Price
    if (currentFilters.priceMin && product.price < Number(currentFilters.priceMin)) return false;
    if (currentFilters.priceMax && product.price > Number(currentFilters.priceMax)) return false;
    // Brand
    if (currentFilters.brand && product.brand !== currentFilters.brand) return false;
    // Category
    if (currentFilters.category && product.category !== currentFilters.category) return false;
    // Rating
    if (currentFilters.rating && product.rating < Number(currentFilters.rating)) return false;
    // Skin Type
    if (currentFilters.skinType && !(product.skinTypes || []).includes(currentFilters.skinType)) return false;
    // Concerns
    if (currentFilters.concerns.length && !currentFilters.concerns.every(c => (product.concerns || []).includes(c))) return false;
    return true;
  });
}

// Utility: Apply sorting
function applySorting() {
  switch (currentSort) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filteredProducts.sort((a, b) => new Date(b.added) - new Date(a.added));
      break;
    default:
      // Featured: no sort or by popularity if available
      break;
  }
}

// Utility: Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const nav = document.getElementById('pagination');
  nav.innerHTML = '';
  if (totalPages <= 1) return;
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-pop-pink text-white' : 'bg-white text-pop-pink border'}`;
    btn.textContent = i;
    btn.addEventListener('click', () => {
      currentPage = i;
      renderShop();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    nav.appendChild(btn);
  }
}

// Utility: Render recently viewed
function renderRecentlyViewed() {
  const grid = document.getElementById('recently-viewed-grid');
  const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  grid.innerHTML = '';
  if (!viewed.length) {
    grid.innerHTML = '<div class="col-span-full text-center text-pop-pink font-semibold">No recently viewed products.</div>';
    return;
  }
  viewed.slice(-6).reverse().forEach(product => {
    const card = document.createElement('div');
    card.className = 'recent-card bg-white rounded shadow p-2 flex flex-col items-center';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded mb-2"/>
      <div class="text-xs font-semibold text-center">${product.name}</div>
    `;
    grid.appendChild(card);
  });
}

// Utility: Populate filter dropdowns
function populateFilters(products) {
  // Brand
  const brands = [...new Set(products.map(p => p.brand))].sort();
  const brandSel = document.getElementById('filter-brand');
  brandSel.innerHTML = '<option value="">All Brands</option>' + brands.map(b => `<option value="${b}">${b}</option>`).join('');
  // Category
  const cats = [...new Set(products.map(p => p.category))].sort();
  const catSel = document.getElementById('filter-category');
  catSel.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

// Main render function
function renderShop() {
  applyFilters();
  applySorting();
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  renderProducts(filteredProducts.slice(start, end));
  renderPagination();
}

// Event listeners
function setupEventListeners() {
  // Filter form
  document.getElementById('filter-form').addEventListener('submit', e => {
    e.preventDefault();
    currentFilters.priceMin = document.getElementById('filter-price-min').value;
    currentFilters.priceMax = document.getElementById('filter-price-max').value;
    currentFilters.brand = document.getElementById('filter-brand').value;
    currentFilters.category = document.getElementById('filter-category').value;
    currentFilters.rating = document.getElementById('filter-rating').value;
    currentFilters.skinType = document.getElementById('filter-skin-type').value;
    const concernsSel = document.getElementById('filter-concerns');
    currentFilters.concerns = Array.from(concernsSel.selectedOptions).map(o => o.value);
    currentPage = 1;
    renderShop();
  });
  // Sort dropdown
  document.getElementById('sort-dropdown').addEventListener('change', e => {
    currentSort = e.target.value;
    renderShop();
  });
  // Category tabs
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilters.category = tab.textContent === 'All' ? '' : tab.textContent;
      currentPage = 1;
      renderShop();
    });
  });
  // Search form
  document.getElementById('shop-search-form').addEventListener('submit', e => {
    e.preventDefault();
    const q = e.target.querySelector('input').value.trim().toLowerCase();
    if (!q) {
      filteredProducts = allProducts.slice();
    } else {
      filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    currentPage = 1;
    applySorting();
    renderShop();
  });
  // Wishlist toggle (event delegation)
  document.getElementById('shop-products-grid').addEventListener('click', e => {
    if (e.target.closest('.wishlist-btn')) {
      const btn = e.target.closest('.wishlist-btn');
      const id = btn.getAttribute('data-id');
      toggleWishlist(id);
      renderShop();
    }
  });
}

// Wishlist toggle logic
function toggleWishlist(id) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const product = allProducts.find(p => p.id == id);
  if (!product) return;
  const idx = wishlist.findIndex(item => item.id == id);
  if (idx > -1) wishlist.splice(idx, 1);
  else wishlist.push(product);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  // Update counter if available
  if (window.updateWishlistCounter) window.updateWishlistCounter();
}

// Recently viewed logic (add on click)
document.getElementById('shop-products-grid').addEventListener('click', e => {
  if (e.target.closest('a.btn--primary')) {
    const card = e.target.closest('.product-card');
    const name = card.querySelector('h3').textContent;
    const product = allProducts.find(p => p.name === name);
    if (!product) return;
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    // Remove if already exists
    viewed = viewed.filter(p => p.id !== product.id);
    viewed.push(product);
    if (viewed.length > 12) viewed = viewed.slice(-12);
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
    renderRecentlyViewed();
  }
});

// Back to top button
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) backToTop.style.display = 'flex';
  else backToTop.style.display = 'none';
});
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Init
async function initShop() {
  allProducts = await fetchProducts();
  filteredProducts = allProducts.slice();
  populateFilters(allProducts);
  renderShop();
  renderRecentlyViewed();
  setupEventListeners();
}

document.addEventListener('DOMContentLoaded', initShop);
