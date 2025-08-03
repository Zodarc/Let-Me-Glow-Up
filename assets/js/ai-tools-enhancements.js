document.addEventListener('DOMContentLoaded', function() {
  // Animate counters
  function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
      start += increment;
      if (start < target) {
        element.textContent = Math.floor(start).toLocaleString() + '+';
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString() + '+';
      }
    }
    updateCounter();
  }

  // Initialize counters when section is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-counter]');
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.counter);
          animateCounter(counter, target);
        });
        observer.unobserve(entry.target);
      }
    });
  });

  const statsSection = document.querySelector('.ai-tools-showcase');
  if (statsSection) observer.observe(statsSection);

  // Modal functionality
  const modal = document.getElementById('tool-preview-modal');
  const closeModal = document.getElementById('close-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  
  document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    });
  });

  [closeModal, closeModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
      });
    }
  });

  // Close modal on outside click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = 'auto';
    }
  });
});
