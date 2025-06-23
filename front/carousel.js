// carousel.js
document.addEventListener('DOMContentLoaded', function () {
  const carousel = document.querySelector('.carousel-container');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-control.prev');
  const nextBtn = document.querySelector('.carousel-control.next');
  const indicatorsContainer = document.querySelector('.carousel-indicators');

  if (!carousel || slides.length === 0) return; // Detener si no hay carrusel

  let currentIndex = 0;
  let intervalId;

  // Crear indicadores
  slides.forEach((_, index) => {
    const indicator = document.createElement('span');
    indicator.addEventListener('click', () => goToSlide(index));
    indicatorsContainer.appendChild(indicator);
  });

  const indicators = document.querySelectorAll('.carousel-indicators span');

  function startCarousel() {
    intervalId = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  }

  function updateCarousel() {
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentIndex);
    });
    resetInterval();
  }

  function resetInterval() {
    clearInterval(intervalId);
    startCarousel();
  }

  // Event listeners
  prevBtn?.addEventListener('click', prevSlide);
  nextBtn?.addEventListener('click', nextSlide);

  // Iniciar si hay al menos un indicador
  if (indicators.length > 0) {
    indicators[0].classList.add('active');
    startCarousel();
  }
});
