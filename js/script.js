let activeCategory = 'todos';
let searchTerm = '';
let likedImages = {};
let filteredImages = [...galleryData];
let selectedImageId = null;

const galleryGrid = document.getElementById('gallery-grid');
const categoryFilters = document.getElementById('category-filters');
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');
const resetFiltersBtn = document.getElementById('reset-filters');
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalCategory = document.getElementById('modal-category');
const closeModalBtn = document.getElementById('close-modal');
const prevImageBtn = document.getElementById('prev-image');
const nextImageBtn = document.getElementById('next-image');
const modalLikeBtn = document.getElementById('modal-like');

const categories = ['todos', ...new Set(galleryData.map(img => img.category))];

function init() {
  renderCategoryFilters();
  renderGallery(galleryData);
  setupEventListeners();
}

function renderCategoryFilters() {
  const filterHtml = categories.map(category => {
    const isActive = category === activeCategory;
    const activeClass = isActive
      ? 'bg-purple-600 text-white'
      : 'bg-gray-200 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-gray-600';

    return `
  <button
    data-category="${category}"
    class="category-btn px-4 py-2 rounded-full text-sm font-medium transition-all ${activeClass}"
  >
    ${category.charAt(0).toUpperCase() + category.slice(1)}
  </button>
  `;
  }).join('');

  categoryFilters.innerHTML = filterHtml;
}

function renderGallery(images) {
  if (images.length === 0) {
    galleryGrid.classList.add('hidden');
    noResults.classList.remove('hidden');
    return;
  }

  galleryGrid.classList.remove('hidden');
  noResults.classList.add('hidden');

  const galleryHtml = images.map(image => {
    const isLiked = likedImages[image.id] ? 'active' : '';

    return `
  <div
    class="gallery-item relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
    data-image-id="${image.id}"
  >
    <img
      src="${image.src}"
      alt="${image.title}"
      class="gallery-img w-full h-64 object-cover"
    />
    <div class="image-overlay absolute inset-0">
      <div class="absolute bottom-0 left-0 right-0 p-4">
        <h3 class="text-white text-lg font-semibold">${image.title}</h3>
        <p class="text-gray-200 text-sm mt-1 line-clamp-2">${image.description}</p>
      </div>
      <button
        class="like-btn absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
        data-image-id="${image.id}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 heart-icon ${isLiked}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  </div>
  `;
  }).join('');

  galleryGrid.innerHTML = galleryHtml;
}

function filterImages() {
  filteredImages = galleryData.filter(image => {
    const matchesCategory = activeCategory === 'todos' || image.category === activeCategory;
    const matchesSearch = searchTerm === '' ||
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  renderGallery(filteredImages);
}

function showImageModal(imageId) {
  const image = galleryData.find(img => img.id === imageId);
  if (!image) return;

  selectedImageId = imageId;
  modalImage.src = image.src;
  modalImage.alt = image.title;
  modalTitle.textContent = image.title;
  modalDescription.textContent = image.description;
  modalCategory.textContent = image.category;

  const heartIcon = modalLikeBtn.querySelector('.heart-icon');
  if (likedImages[imageId]) {
    heartIcon.classList.add('active');
  } else {
    heartIcon.classList.remove('active');
  }

  imageModal.classList.remove('hidden');
  imageModal.classList.add('flex', 'animate-fadeIn');

  document.body.style.overflow = 'hidden';
}

function closeImageModal() {
  imageModal.classList.add('hidden');
  imageModal.classList.remove('flex', 'animate-fadeIn');
  selectedImageId = null;

  document.body.style.overflow = '';
}

function navigateImage(direction) {
  if (!selectedImageId || filteredImages.length === 0) return;

  const currentIndex = filteredImages.findIndex(img => img.id === selectedImageId);
  let newIndex;

  if (direction === 'next') {
    newIndex = (currentIndex + 1) % filteredImages.length;
  } else {
    newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
  }

  showImageModal(filteredImages[newIndex].id);
}

function toggleLike(imageId) {
  likedImages[imageId] = !likedImages[imageId];

  const galleryHearts = document.querySelectorAll(`.like-btn[data-image-id="${imageId}"] .heart-icon`);
  galleryHearts.forEach(heart => {
    if (likedImages[imageId]) {
      heart.classList.add('active');
    } else {
      heart.classList.remove('active');
    }
  });

  if (selectedImageId === imageId) {
    const modalHeart = modalLikeBtn.querySelector('.heart-icon');
    if (likedImages[imageId]) {
      modalHeart.classList.add('active');
    } else {
      modalHeart.classList.remove('active');
    }
  }
}

function setupEventListeners() {
  categoryFilters.addEventListener('click', (e) => {
    const categoryBtn = e.target.closest('.category-btn');
    if (!categoryBtn) return;

    activeCategory = categoryBtn.dataset.category;
    renderCategoryFilters();
    filterImages();
  });

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    filterImages();
  });

  resetFiltersBtn.addEventListener('click', () => {
    activeCategory = 'todos';
    searchTerm = '';
    searchInput.value = '';
    renderCategoryFilters();
    filterImages();
  });

  galleryGrid.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
      e.stopPropagation();
      const imageId = parseInt(likeBtn.dataset.imageId);
      toggleLike(imageId);
      return;
    }

    const galleryItem = e.target.closest('.gallery-item');
    if (galleryItem) {
      const imageId = parseInt(galleryItem.dataset.imageId);
      showImageModal(imageId);
    }
  });

  closeModalBtn.addEventListener('click', closeImageModal);
  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      closeImageModal();
    }
  });

  prevImageBtn.addEventListener('click', () => navigateImage('prev'));
  nextImageBtn.addEventListener('click', () => navigateImage('next'));

  modalLikeBtn.addEventListener('click', () => {
    if (selectedImageId) {
      toggleLike(selectedImageId);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!selectedImageId) return;

    if (e.key === 'Escape') {
      closeImageModal();
    } else if (e.key === 'ArrowLeft') {
      navigateImage('prev');
    } else if (e.key === 'ArrowRight') {
      navigateImage('next');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
