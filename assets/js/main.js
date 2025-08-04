// Main JavaScript file
// ===== MAIN JAVASCRIPT FILE =====

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initAnimations();
    initNewsletterForm();
    initSearch();
    initModals();
    initAccordions();
    initTabs();
    initTooltips();
    initLazyLoading();
});

// ===== NAVIGATION =====
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const searchToggle = document.getElementById('search-toggle');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('show-menu');
            navToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('show-menu');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle?.contains(e.target) && !navMenu?.contains(e.target)) {
            navMenu?.classList.remove('show-menu');
            navToggle?.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Search toggle
    if (searchToggle) {
        searchToggle.addEventListener('click', function() {
            // Implement search functionality
            console.log('Search clicked');
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== ANIMATIONS =====
function initAnimations() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
    
    // Add scroll animations for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.card, .feature__card, .product-card, .blog-card').forEach(el => {
        observer.observe(el);
    });
}

// ===== NEWSLETTER FORM =====
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            if (validateEmail(email)) {
                // Show success message
                showToast('Thank you for subscribing!', 'success');
                this.reset();
                
                // Track newsletter signup
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'newsletter_signup', {
                        'event_category': 'engagement',
                        'event_label': 'homepage'
                    });
                }
            } else {
                showToast('Please enter a valid email address.', 'error');
            }
        });
    }
}

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
    const searchInput = document.querySelector('.search__input');
    
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
    }
}

function performSearch(query) {
    if (query.length < 2) return;
    
    // Implement search logic here
    console.log('Searching for:', query);
    
    // Example: Redirect to search results page
    // window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
}

// ===== MODAL FUNCTIONALITY =====
function initModals() {
    // Open modal
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
    
    // Close modal
    document.querySelectorAll('.modal__close, .modal').forEach(element => {
        element.addEventListener('click', function(e) {
            if (e.target === this || this.classList.contains('modal__close')) {
                closeModal(this.closest('.modal'));
            }
        });
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// ===== ACCORDION FUNCTIONALITY =====
function initAccordions() {
    document.querySelectorAll('.accordion__header').forEach(header => {
        header.addEventListener('click', function() {
            const item = this.closest('.accordion__item');
            const isActive = item.classList.contains('accordion__item--active');
            
            // Close all accordion items
            document.querySelectorAll('.accordion__item').forEach(accordionItem => {
                accordionItem.classList.remove('accordion__item--active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('accordion__item--active');
            }
        });
    });
}

// ===== TABS FUNCTIONALITY =====
function initTabs() {
    document.querySelectorAll('.tabs__link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabContainer = this.closest('.tabs');
            const targetId = this.getAttribute('href').substring(1);
            
            // Remove active class from all tabs and content
            tabContainer.querySelectorAll('.tabs__item').forEach(item => {
                item.classList.remove('tabs__item--active');
            });
            tabContainer.querySelectorAll('.tabs__content').forEach(content => {
                content.classList.remove('tabs__content--active');
            });
            
            // Add active class to clicked tab and corresponding content
            this.closest('.tabs__item').classList.add('tabs__item--active');
            document.getElementById(targetId)?.classList.add('tabs__content--active');
        });
    });
}

// ===== TOOLTIP FUNCTIONALITY =====
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = this.querySelector('.tooltip__content');
            if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            }
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.tooltip__content');
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
            }
        });
    });
}

// ===== LAZY LOADING =====
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== UTILITY FUNCTIONS =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type} show`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', debounce(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove header background on scroll
        if (scrollTop > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header?.classList.add('header--hidden');
        } else {
            header?.classList.remove('header--hidden');
        }
        
        lastScrollTop = scrollTop;
    }, 10));
}

// ===== FORM VALIDATION =====
function initFormValidation() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    showFieldError(field, 'This field is required');
                } else {
                    clearFieldError(field);
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showToast('Please fill in all required fields.', 'error');
            }
        });
    });
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = message;
    
    field.parentNode.appendChild(error);
    field.classList.add('error');
}

function clearFieldError(field) {
    const error = field.parentNode.querySelector('.form-error');
    if (error) {
        error.remove();
    }
    field.classList.remove('error');
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// ===== ANALYTICS =====
function initAnalytics() {
    // Google Analytics event tracking
    if (typeof gtag !== 'undefined') {
        // Track page views
        gtag('config', 'G-XXXXXXXXXX', {
            page_title: document.title,
            page_location: window.location.href
        });
        
        // Track button clicks
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function() {
                gtag('event', 'button_click', {
                    'event_category': 'engagement',
                    'event_label': this.textContent.trim()
                });
            });
        });
    }
}

// ===== PERFORMANCE OPTIMIZATION =====
function initPerformanceOptimization() {
    // Preload critical resources
    const criticalImages = [
        'assets/images/hero-image.jpg',
        'assets/images/logo.png'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
    
    // Service worker registration (if available)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// ===== ACCESSIBILITY =====
function initAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add skip link styles
    const style = document.createElement('style');
    style.textContent = `
        .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--pop-pink);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
        }
        .skip-link:focus {
            top: 6px;
        }
    `;
    document.head.appendChild(style);
    
    // Keyboard navigation for dropdowns
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown__trigger');
        const menu = dropdown.querySelector('.dropdown__menu');
        
        if (trigger && menu) {
            trigger.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    menu.classList.toggle('show');
                }
            });
        }
    });
}

// ===== HERO CAROUSEL =====
function initHeroCarousel() {
    const carousel = document.querySelector('.hero__carousel');
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel__slide');
    const dots = carousel.querySelectorAll('.carousel__dot');
    const prevBtn = carousel.querySelector('.carousel__btn--prev');
    const nextBtn = carousel.querySelector('.carousel__btn--next');
    
    let currentSlide = 0;
    let autoplayInterval;
    const autoplayDelay = 5000; // 5 seconds
    
    // Initialize carousel
    function initCarousel() {
        if (slides.length === 0) return;
        
        // Show first slide
        showSlide(0);
        
        // Start autoplay
        startAutoplay();
        
        // Add event listeners
        if (prevBtn) prevBtn.addEventListener('click', () => navigateSlide(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => navigateSlide(1));
        
        // Add dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
        
        // Pause autoplay on hover
        carousel.addEventListener('mouseenter', pauseAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        
        // Touch/swipe support for mobile
        let startX = 0;
        let endX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
        // Add this after the initHeroCarousel() function

// ===== MOBILE SCROLL INDICATORS =====
function initMobileScrollIndicators() {
    const container = document.querySelector('.ai-tools-showcase .grid');
    const indicators = document.querySelectorAll('#mobile-indicators div');
    
    if (!container || !indicators.length) return;
    
    container.addEventListener('scroll', () => {
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (maxScroll === 0) return; // Prevent division by zero
        
        const scrollPercent = scrollLeft / maxScroll;
        const activeIndex = Math.round(scrollPercent * (indicators.length - 1));
        
        indicators.forEach((indicator, index) => {
            if (index === activeIndex) {
                indicator.className = 'w-8 h-2 rounded-full bg-pop-pink transition-all duration-300';
            } else {
                indicator.className = 'w-2 h-2 rounded-full bg-gray-300 transition-all duration-300';
            }
        });
    });
}
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    navigateSlide(1); // Swipe left - next slide
                } else {
                    navigateSlide(-1); // Swipe right - previous slide
                }
            }
        }
    }
    
    // Show specific slide
    function showSlide(index) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current slide and dot
        if (slides[index]) slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        
        currentSlide = index;
    }
    
    // Navigate to next/previous slide
    function navigateSlide(direction) {
        const newIndex = (currentSlide + direction + slides.length) % slides.length;
        showSlide(newIndex);
    }
    
    // Go to specific slide
    function goToSlide(index) {
        if (index >= 0 && index < slides.length) {
            showSlide(index);
        }
    }
    
    // Start autoplay
    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            navigateSlide(1);
        }, autoplayDelay);
    }
    
    // Pause autoplay
    function pauseAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
    
    // Initialize the carousel
    initCarousel();
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (carousel.matches(':hover') || carousel.matches(':focus-within')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateSlide(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateSlide(1);
            }
        }
    });
}

// ===== INITIALIZE ALL FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initAnimations();
    initNewsletterForm();
    initSearch();
    initModals();
    initAccordions();
    initTabs();
    initTooltips();
    initLazyLoading();
    initScrollEffects();
    initFormValidation();
    initThemeToggle();
    initAnalytics();
    initPerformanceOptimization();
    initAccessibility();
    initHeroCarousel();
    initMobileScrollIndicators();
    
    console.log('LetMeGlowUp - All functionality initialized!');
});
