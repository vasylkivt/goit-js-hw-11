import { createLiMarkup } from './js/createLiMarkup';
import { searchImg } from './js/searchImg';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Notify } from 'notiflix/build/notiflix-notify-aio';

const formEl = document.getElementById('search-form');
const galleryEl = document.getElementById('gallery-list');
const loadMoreEl = document.querySelector('.load-more');

const gallerySLBox = new SimpleLightbox('.gallery-list a');

const IMAGE_PER_PAGE = 40;
let searchName;
let page = 1;
let totalPage;
let test = 'deploy'

formEl.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();

  galleryEl.innerHTML = '';
  page = 1;
  searchName = e.currentTarget.elements.searchQuery.value;

  loadMoreEl.addEventListener('click', onLoadMoreClick);
  loadMoreEl.classList.remove('load-more-show');

  await searchImg(searchName, IMAGE_PER_PAGE, page)
    .then(response => {
      if (response.totalHits) {
        Notify.success(`Ура! Ми знайшли ${response.total} картинок.`);
      }
      if (response.totalHits > IMAGE_PER_PAGE) {
        loadMoreEl.classList.add('load-more-show');
      }
      if (response.totalHits === response.total && response.total) {
        Notify.success(`Вам доступні всі результати пошуку.`);
      } else if (response.totalHits) {
        Notify.info(`Вам доступно ${response.totalHits} результатів пошуку.`);
      }

      totalPage = response.totalHits / IMAGE_PER_PAGE;
      onFetchSuccess(response);
    })
    .catch(onFetchError);
  await gallerySLBox.refresh();
}

async function onLoadMoreClick() {
  page += 1;

  if (page > totalPage) {
    loadMoreEl.classList.remove('load-more-show');
    Notify.info('Вибачте, але ви досягли кінця результатів пошуку.');
  }

  await searchImg(searchName, IMAGE_PER_PAGE, page)
    .then(onFetchSuccess)
    .catch(onFetchError);
  await gallerySLBox.refresh();

  await smoothScroll();
}

function smoothScroll() {
  const { height: cardHeight } =
    galleryEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onFetchSuccess({ hits }) {
  if (hits.length === 0) {
    Notify.failure(
      'На жаль, немає зображень, що відповідають вашому запиту. Будь ласка, спробуйте ще раз.'
    );
    return;
  }

  galleryEl.insertAdjacentHTML('beforeend', makeGalleryMarkup(hits));
}

function onFetchError(error) {
  countryList.innerHTML = '';
  cornetCountryInfo.innerHTML = '';
  if (error.message === '404') {
    Notify.failure('Помилка');
  }
  console.log(error);
}

function makeGalleryMarkup(gallery) {
  console.log(gallery);

  return gallery.reduce((acc, image) => {
    return (acc += createLiMarkup(image));
  }, '');
}
