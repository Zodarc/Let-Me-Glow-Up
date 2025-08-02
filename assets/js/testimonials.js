// Render testimonials from JSON and setup carousel nav after rendering
async function loadTestimonials() {
  const res = await fetch('assets/data/testimonials.json');
  const testimonials = await res.json();
  // Carousel grid
  const mobileGrid = document.getElementById('testimonials-grid');
  if (mobileGrid) {
    mobileGrid.innerHTML = testimonials.map(t => `
      <div class='testimonial-card min-w-[85vw] max-w-xs bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-soft-beige hover:shadow-2xl transition snap-center'>
        <img src='${t.image}' alt='${t.name}' class='w-16 h-16 rounded-full mb-3 object-cover border-2 border-pop-pink' />
        <div class="flex items-center justify-center mb-2">
          ${renderStars(5)}
        </div>
        <p class='text-gray-700 mb-2 font-medium'>"${t.text}"</p>
        <span class='font-semibold text-pop-pink'>${t.name}</span>
        <span class='text-xs text-gray-400'>${t.location}</span>
      </div>
    `).join('');
  }
  setupTestimonialsCarouselNav();
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

// Setup carousel navigation after testimonials are rendered
function setupTestimonialsCarouselNav() {
  const carousel = document.querySelector('.testimonials-scroll');
  const prevBtn = document.getElementById('testimonials-prev');
  const nextBtn = document.getElementById('testimonials-next');

  function updateArrowVisibility() {
    if (!carousel || !prevBtn || !nextBtn) return;
    // Only show arrows on desktop
    if (window.innerWidth >= 768) {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    } else {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  }

  function scrollTestimonials(direction) {
    if (!carousel) return;
    // Scroll by the width of one card (assume all cards same width)
    const card = carousel.querySelector('.testimonial-card');
    if (card) {
      const scrollAmount = card.offsetWidth + 16; // 16px gap
      carousel.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  if (prevBtn && nextBtn && carousel) {
    prevBtn.onclick = () => scrollTestimonials('prev');
    nextBtn.onclick = () => scrollTestimonials('next');
    window.addEventListener('resize', updateArrowVisibility);
    updateArrowVisibility();
    // Auto-slide every 4 seconds
    let autoSlide = setInterval(() => {
      scrollTestimonials('next');
    }, 4000);

    // Pause auto-slide on mouse enter, resume on leave (desktop only)
    carousel.addEventListener('mouseenter', () => clearInterval(autoSlide));
    carousel.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => {
        scrollTestimonials('next');
      }, 4000);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('testimonials-grid')) {
    loadTestimonials();
  }
});


