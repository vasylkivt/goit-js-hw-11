import { makeGalleryMarkup } from './js/makeGalleryMarkup';
import { fetchImages } from './js/fetchImages';
import { smoothScroll } from './js/smoothScroll';

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

formEl.addEventListener('submit', onSubmit);

addIntersectionObserver();

async function onSubmit(e) {
  e.preventDefault();
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

  afterClickSubmit();
  beforeSearch();
  resetToDefault();

  try {
    objectForObservation.classList.remove('scroll-guard-show');
    const { data } = await fetchImages(searchName, IMAGE_PER_PAGE, page);
    totalPage = data.totalHits / IMAGE_PER_PAGE;

    if (data.totalHits === data.total && data.total) {
      Notify.success(
        `Ура! Ми знайшли ${data.total} картинок. Вам доступні всі результати пошуку.`
      );
    } else if (data.totalHits) {
      Notify.success(
        `Ура! Ми знайшли ${data.total} картинок. Вам доступно ${data.totalHits} результатів пошуку.`
      );
    }

    if (data.hits.length) {
      objectForObservation.classList.add('object-for-observation-show');
    }

    onFetchSuccess(data);
  } catch (error) {
    console.log(error);
    Notify.failure(
      `На жаль, щось пішло не так. Будь ласка, спробуйте ще раз. ${error.message}, ${error.code}`
    );
    resetToDefault();
  }
}

function afterClickSubmit() {
  totalPage = 0;
  galleryEl.innerHTML = '';
  page = 1;
}

function beforeSearch() {
  backdropLoaderEl.classList.add('backdrop-loader-show');
  document.body.classList.add('body-overflow-hidden');
}

function resetToDefault() {
  loadMoreEl.classList.remove('load-more-show');
  backdropLoaderEl.classList.remove('backdrop-loader-show');
  document.body.classList.remove('body-overflow-hidden');
}

function onFetchSuccess({ hits }) {
  if (hits.length === 0) {
    Notify.failure(
      'На жаль, немає зображень, що відповідають вашому запиту. Будь ласка, спробуйте ще раз.'
    );
    resetToDefault();
    return;
  }
  galleryEl.insertAdjacentHTML('beforeend', makeGalleryMarkup(hits));
  gallerySLBox.refresh();
  setTimeout(() => {
    backdropLoaderEl.classList.remove('backdrop-loader-show');
    document.body.classList.remove('body-overflow-hidden');
  }, 500);
}

async function loadMoreImage() {
  beforeSearch();

  if (page > totalPage) {
    return;
  }

  page += 1;

  try {
    const { data } = await fetchImages(searchName, IMAGE_PER_PAGE, page);
    onFetchSuccess(data);
    smoothScroll(galleryEl.firstElementChild);
  } catch (error) {
    console.log(error);
    Notify.failure(
      `На жаль, щось пішло не так. Будь ласка, спробуйте ще раз.${error.message}, ${error.code}`
    );
    resetToDefault();
  }
}

function addIntersectionObserver() {
  const options = {
    rootMargin: '100px',
    threshold: 1.0,
  };
  const observer1 = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (infiniteScrollEl.checked && page < totalPage) {
          loadMoreImage();
        } else if (!infiniteScrollEl.checked && page < totalPage) {
          loadMoreEl.classList.add('load-more-show');
          loadMoreEl.addEventListener('click', loadMoreImage);
        } else if (totalPage) {
          resetToDefault();
          Notify.info('Вибачте, але ви досягли кінця результатів пошуку.');
        }
      }
    });
  }, options);

  observer1.observe(document.querySelector('.object-for-observation'));
}