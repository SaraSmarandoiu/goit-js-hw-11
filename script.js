const API_KEY =
  '43967150-3be5b0a39ae7a872814e18aa5';
const BASE_URL = 'https://pixabay.com/api/';
let searchQuery = '';
let page = 1;
const perPage = 40;

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

form.addEventListener('submit', onSearch);
loadMoreButton.addEventListener('click', loadMoreImages);

let lightbox = new SimpleLightbox('.gallery a');

async function onSearch(event) {
  event.preventDefault();
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();
  if (!searchQuery) {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }

  page = 1;
  gallery.innerHTML = '';
  loadMoreButton.style.display = 'none';

  try {
    const response = await fetchImages(searchQuery, page, perPage);
    const { hits, totalHits } = response.data;

    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    renderGallery(hits);
    lightbox.refresh();

    if (totalHits > perPage) {
      loadMoreButton.style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
  }
}

async function loadMoreImages() {
  page += 1;

  try {
    const response = await fetchImages(searchQuery, page, perPage);
    const { hits, totalHits } = response.data;

    renderGallery(hits);
    lightbox.refresh();

    const totalLoadedImages = page * perPage;
    if (totalLoadedImages >= totalHits) {
      loadMoreButton.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Failed to fetch images. Please try again later.');
  }

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

async function fetchImages(query, page, perPage) {
  const params = {
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page,
    per_page: perPage,
  };

  const response = await axios.get(BASE_URL, { params });
  return response;
}

function renderGallery(images) {
  const markup = images
    .map(image => {
      return `
            <div class="photo-card">
                <a href="${image.largeImageURL}">
                    <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
                </a>
                <div class="info">
                    <p class="info-item"><b>Likes</b> ${image.likes}</p>
                    <p class="info-item"><b>Views</b> ${image.views}</p>
                    <p class="info-item"><b>Comments</b> ${image.comments}</p>
                    <p class="info-item"><b>Downloads</b> ${image.downloads}</p>
                </div>
            </div>
        `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}
