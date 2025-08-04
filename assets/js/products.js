let currentFilters = {
  category: 'All',
  sort: 'featured',
  priceMin: 0,
  priceMax: 200,
  rating: 0,
  brand: 'all'
};

let currentPage = 1;
const PRODUCTS_PER_PAGE = 12;

async function loadProducts(category = 'All', append = false) {
  const grid = document.getElementById('products-grid');
  const loading = document.getElementById('products-loading');
  const countElement = document.getElementById('products-count');
  
  // Update current filter
  currentFilters.category = category;
  
  // Show loading state
  if (!append) {
    if (loading) {
      loading.classList.remove('hidden');
      showSkeletonCards();
    }
    grid.classList.add('opacity-50');
  }
  
  try {
    const res = await fetch('assets/data/products.json');
    const allProducts = await res.json();
    
    // Apply filters
    let filtered = filterProducts(allProducts, currentFilters);
    
    // Apply sorting
    filtered = sortProducts(filtered, currentFilters.sort);
    
    // Only show 4 products on homepage (keep your existing logic)
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
      filtered = filtered.slice().reverse().slice(0, 4);
    } else {
      // Pagination for other pages
      const startIndex = append ? (currentPage - 1) * PRODUCTS_PER_PAGE : 0;
      const endIndex = startIndex + PRODUCTS_PER_PAGE;
      filtered = filtered.slice(startIndex, endIndex);
    }
    
    // Update count
    if (countElement) {
      countElement.textContent = `Showing ${filtered.length} products`;
    }
    
    // Render products (keep your existing rendering logic but enhance it)
    grid.innerHTML = filtered.map(product => {
      const discounted = product.discount && product.oldPrice > product.price;
      const isShop = window.location.pathname.endsWith('shop.html');
      
      return `
      <div class="product-card group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-soft-beige transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeInUp">
        ${discounted ? `<span class="absolute top-4 left-4 bg-pop-pink text-white text-xs font-bold px-3 py-1 rounded-full z-10 animate-pulse">-${product.discount}%</span>` : ''}
        ${product.trending ? `<span class="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">🔥 Trending</span>` : ''}
        ${isShop ? `<button class="wishlist-btn absolute top-4 right-4 bg-white/80 rounded-full p-2 shadow hover:bg-pop-pink hover:text-white transition z-10" aria-label="Add to Wishlist" data-id="${product.id}"><i class="fa fa-heart"></i></button>` : ''}
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
            <a href="product.html?id=${product.id}" class="btn btn--primary flex-1 px-3 py-2 rounded-full font-medium affiliate-btn" data-id="${product.id}">Buy Now</a>
            <button class="btn btn--secondary flex-1 px-3 py-2 rounded-full font-medium quick-view-btn" data-id="${product.id}">Quick View</button>
          </div>
        </div>
      </div>
      `;
    }).join('');
    
    // Hide loading, show grid
    if (loading) loading.classList.add('hidden');
    grid.classList.remove('opacity-50');
    
    // Keep your existing setup calls
    if (window.location.pathname.endsWith('shop.html')) {
      setupWishlistButtons();
    }
    setupAffiliateTracking();
    if (window.updateWishlistCounter) window.updateWishlistCounter();
    
    // Setup new interactions
    setTimeout(setupQuickView, 100);
    
  } catch (error) {
    console.error('Error loading products:', error);
    grid.innerHTML = '<div class="col-span-full text-center text-gray-500">Failed to load products</div>';
  }
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

function setupWishlistButtons() {
  const buttons = document.querySelectorAll('.wishlist-btn');
  // On load, set button state based on wishlist
  let wishlist = JSON.parse(localStorage.getItem('letmeglowup_wishlist') || '[]');
  buttons.forEach(btn => {
    const id = btn.getAttribute('data-id');
    const inWishlist = wishlist.some(item => String(item.id) === String(id));
    if (inWishlist) {
      btn.classList.add('active');
      btn.querySelector('i').classList.add('text-pop-pink');
      btn.querySelector('i').classList.remove('text-gray-400');
    } else {
      btn.classList.remove('active');
      btn.querySelector('i').classList.remove('text-pop-pink');
      btn.querySelector('i').classList.add('text-gray-400');
    }
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      let wishlist = JSON.parse(localStorage.getItem('letmeglowup_wishlist') || '[]');
      const id = this.getAttribute('data-id');
      const productCard = this.closest('.product-card');
      const title = productCard.querySelector('.product-card__title').textContent;
      const image = productCard.querySelector('img').getAttribute('src');
      const price = parseFloat(productCard.querySelector('.product-card__price-current').textContent.replace('$',''));
      const oldPriceEl = productCard.querySelector('.product-card__price-original');
      const oldPrice = oldPriceEl ? parseFloat(oldPriceEl.textContent.replace('$','')) : null;
      const category = productCard.querySelector('.text-glossy-brown')?.textContent || '';
      const discountEl = productCard.querySelector('span.absolute');
      const discount = discountEl ? parseInt(discountEl.textContent.replace(/\D/g, '')) : null;
      const product = { id: Number(id), title, image, price, oldPrice, category, discount };
      const idx = wishlist.findIndex(item => String(item.id) === String(id));
      if (idx > -1) {
        wishlist.splice(idx, 1);
        this.classList.remove('active');
        this.querySelector('i').classList.remove('text-pop-pink');
        this.querySelector('i').classList.add('text-gray-400');
      } else {
        wishlist.push(product);
        this.classList.add('active');
        this.querySelector('i').classList.add('text-pop-pink');
        this.querySelector('i').classList.remove('text-gray-400');
      }
      localStorage.setItem('letmeglowup_wishlist', JSON.stringify(wishlist));
      if (window.updateWishlistCounter) window.updateWishlistCounter();
    });
  });
}

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

function setupCategoryTabs() {
  const tabs = document.querySelectorAll('.category-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => {
        t.classList.remove('active', 'bg-pop-pink', 'text-white');
        t.classList.add('bg-cream-white', 'text-deep-black');
      });
      this.classList.add('active', 'bg-pop-pink', 'text-white');
      this.classList.remove('bg-cream-white', 'text-deep-black');
      
      // Get category from data attribute or text content
      const category = this.getAttribute('data-category') || this.textContent.trim();
      loadProducts(category);
    });
  });
}

function setupQuickView() {
  // Create modal if not present
  if (!document.getElementById('quick-view-modal')) {
    const modal = document.createElement('div');
    modal.id = 'quick-view-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content" style="max-width: 420px;">
        <button class="modal__close" aria-label="Close">&times;</button>
        <div id="quick-view-content"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  // Close modal logic
  document.querySelector('#quick-view-modal .modal__close').onclick = function() {
    document.getElementById('quick-view-modal').classList.remove('show');
  };
  document.getElementById('quick-view-modal').onclick = function(e) {
    if (e.target === this) this.classList.remove('show');
  };
  // Button event
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.onclick = async function() {
      const id = this.getAttribute('data-id');
      const res = await fetch('assets/data/products.json');
      const products = await res.json();
      const product = products.find(p => String(p.id) === String(id));
      if (!product) return;
      document.getElementById('quick-view-content').innerHTML = `
        <div class="text-center mb-4">
          <img src="${product.image}" alt="${product.title}" class="w-40 h-40 object-contain mx-auto rounded-lg mb-2" />
          <h3 class="text-lg font-bold mb-1">${product.title}</h3>
          <div class="text-sm text-gray-500 mb-2">${product.brand || ''}</div>
          <div class="flex items-center justify-center gap-2 mb-2">
            <span class="text-pop-pink font-bold text-xl">$${product.price.toFixed(2)}</span>
            ${product.oldPrice ? `<span class='line-through text-gray-400'>$${product.oldPrice.toFixed(2)}</span>` : ''}
            ${product.discount ? `<span class='text-green-600 font-semibold'>${product.discount}% off</span>` : ''}
          </div>
          <div class="mb-2">${product.description ? product.description.substring(0, 100) + '...' : ''}</div>
          <a href="product.html?id=${product.id}" class="btn btn--primary w-full">View Full Details</a>
        </div>
      `;
      document.getElementById('quick-view-modal').classList.add('show');
    };
  });
}

function filterProducts(products, filters) {
  return products.filter(product => {
    // Category filter
    if (filters.category !== 'All' && product.category !== filters.category) {
      return false;
    }
    
    // Price filter
    if (product.price < filters.priceMin || product.price > filters.priceMax) {
      return false;
    }
    
    // Rating filter
    if (product.rating < filters.rating) {
      return false;
    }
    
    return true;
  });
}

function sortProducts(products, sortType) {
  const sorted = [...products];
  
  switch (sortType) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.added) - new Date(a.added));
    default:
      return sorted; // Featured order
  }
}

function showSkeletonCards() {
  const loading = document.getElementById('products-loading');
  if (!loading) return;
  
  loading.innerHTML = Array(8).fill('').map(() => `
    <div class="product-card skeleton animate-pulse">
      <div class="bg-gray-200 h-48 rounded-t-2xl"></div>
      <div class="p-5">
        <div class="bg-gray-200 h-4 rounded mb-2"></div>
        <div class="bg-gray-200 h-6 rounded mb-2"></div>
        <div class="bg-gray-200 h-4 rounded mb-2 w-2/3"></div>
        <div class="bg-gray-200 h-8 rounded mt-4"></div>
      </div>
    </div>
  `).join('');
}

function setupEnhancedFilters() {
  // Sort dropdown
  const sortSelect = document.getElementById('sort-products');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      currentFilters.sort = this.value;
      loadProducts(currentFilters.category);
    });
  }
  
  // Filter toggle
  const filterToggle = document.getElementById('filter-toggle');
  const filterPanel = document.getElementById('filter-panel');
  if (filterToggle && filterPanel) {
    filterToggle.addEventListener('click', function() {
      filterPanel.classList.toggle('hidden');
    });
  }
  
  // Load more button
  const loadMoreBtn = document.getElementById('load-more-products');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      currentPage++;
      loadProducts(currentFilters.category, true);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Keep your existing cleanup logic
  if (!window.location.pathname.endsWith('shop.html')) {
    fetch('assets/data/products.json').then(res => res.json()).then(products => {
      let wishlist = JSON.parse(localStorage.getItem('letmeglowup_wishlist') || '[]');
      const validIds = new Set(products.map(p => String(p.id)));
      const filtered = wishlist.filter(item => validIds.has(String(item.id)));
      if (filtered.length !== wishlist.length) {
        localStorage.setItem('letmeglowup_wishlist', JSON.stringify(filtered));
        if (window.updateWishlistCounter) window.updateWishlistCounter();
      }
    });
  }
  
  // Initialize everything
  loadProducts();
  setupCategoryTabs();
  setupEnhancedFilters(); // Add this new function call
  setTimeout(setupQuickView, 500);
});
