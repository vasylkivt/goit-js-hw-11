import { makeGalleryMarkup } from './js/makeGalleryMarkup';
import { fetchImages } from './js/fetchImages';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';
import SimpleLightbox from 'simplelightbox';

import 'modern-normalize/modern-normalize.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const gallerySLBox = new SimpleLightbox('.gallery-list a');

const formEl = document.getElementById('search-form');
const galleryEl = document.getElementById('gallery-list');
const loadMoreEl = document.querySelector('.load-more');
const objectForObservation = document.querySelector('.object-for-observation');
const infiniteScrollEl = document.querySelector('.infinite-scroll-input');
const backdropLoaderEl = document.querySelector('.backdrop-loader');

const IMAGE_PER_PAGE = 40;
let searchName;
let page;
let totalPage;

addIntersectionObserver();

formEl.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();
  galleryEl.innerHTML = '';
  page = 1;
  searchName = e.currentTarget.elements.searchQuery.value;

  if (!searchName.trim()) {
    await new Promise(resolve => {
      Confirm.show(
        '',
        'Ви хочите здійснити пошук з порожнім полем?',
        'Так',
        'Ні',
        () => {
          resolve(); // Викликаємо resolve, щоб продовжити виконання коду
        },
        () => {
          resetToDefault();
          return;
        },
        {
          width: '350px',
        }
      );
    });
  }

  await beforeSearch();
  try {
    const { data } = await fetchImages(searchName, IMAGE_PER_PAGE, page);

    if (data.totalHits) {
      Notify.success(`Ура! Ми знайшли ${data.total} картинок.`);
      totalPage = data.totalHits / IMAGE_PER_PAGE;
    }

    if (data.totalHits === data.total && data.total) {
      Notify.success(`Вам доступні всі результати пошуку.`);
    } else if (data.totalHits) {
      Notify.info(`Вам доступно ${data.totalHits} результатів пошуку.`);
    }

    await objectForObservation.classList.add('object-for-observation-show');

    await onFetchSuccess(data);
  } catch (error) {
    Notify.failure(error.message);
    resetToDefault();
  }
}

function beforeSearch() {
  backdropLoaderEl.classList.add('backdrop-loader-show');
  document.body.style.overflow = 'hidden';
}

async function onFetchSuccess({ hits }) {
  if (hits.length === 0) {
    Notify.failure(
      'На жаль, немає зображень, що відповідають вашому запиту. Будь ласка, спробуйте ще раз.'
    );
    await resetToDefault();

    return;
  }
  await galleryEl.insertAdjacentHTML('beforeend', makeGalleryMarkup(hits));

  await gallerySLBox.refresh();

  setTimeout(() => {
    backdropLoaderEl.classList.remove('backdrop-loader-show');
    document.body.style.overflow = 'auto';
  }, 500);
}

function resetToDefault() {
  loadMoreEl.classList.remove('load-more-show');
  objectForObservation.classList.remove('scroll-guard-show');
  backdropLoaderEl.classList.remove('backdrop-loader-show');
  document.body.style.overflow = 'auto';
}

async function loadMoreImage() {
  beforeSearch();
  if (page > totalPage) {
    return;
  }
  page += 1;
  try {
    const { data } = await fetchImages(searchName, IMAGE_PER_PAGE, page);
    await onFetchSuccess(data);
    await smoothScroll();
  } catch (error) {
    resetToDefault(error);
  }
}

function addIntersectionObserver() {
  const options = {
    rootMargin: '5px',
    threshold: 1.0,
  };
  const observer1 = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (infiniteScrollEl.checked && page < totalPage) {
          loadMoreImage();
        }
        if (!infiniteScrollEl.checked) {
          loadMoreEl.classList.add('load-more-show');
          loadMoreEl.addEventListener('click', loadMoreImage);
        }
        if (page > totalPage) {
          loadMoreEl.classList.remove('load-more-show');
          Notify.info('Вибачте, але ви досягли кінця результатів пошуку.');
        }
      }
    });
  }, options);

  observer1.observe(document.querySelector('.object-for-observation'));
}

function smoothScroll() {
  const { height: cardHeight } =
    galleryEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 1.9,
    behavior: 'smooth',
  });
}
