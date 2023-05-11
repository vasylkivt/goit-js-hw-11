import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { makeGalleryMarkup } from './js/makeGalleryMarkup';
import { fetchImages } from './js/fetchImages';

const gallerySLBox = new SimpleLightbox('.gallery-list a');

const formEl = document.getElementById('search-form');
const galleryEl = document.getElementById('gallery-list');
const loadMoreEl = document.querySelector('.load-more');
const scrollGuardEl = document.querySelector('.scroll-guard');
const infiniteScrollEl = document.querySelector('.infinite-scroll');

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

  try {
    const { data } = await fetchImages(searchName, IMAGE_PER_PAGE, page);
    if (data.totalHits > IMAGE_PER_PAGE) {
      loadMoreEl.classList.add('load-more-show');
      addButtonLoadMore();
    }

    if (data.totalHits) {
      Notify.success(`Ура! Ми знайшли ${data.total} картинок.`);
    }

    if (data.totalHits === data.total && data.total) {
      Notify.success(`Вам доступні всі результати пошуку.`);
    } else if (data.totalHits) {
      Notify.info(`Вам доступно ${data.totalHits} результатів пошуку.`);
    }

    await onFetchSuccess(data);
    await gallerySLBox.refresh();

    totalPage = await (data.totalHits / IMAGE_PER_PAGE);

    await scrollGuardEl.classList.add('scroll-guard-show');
  } catch (error) {
    onFetchError(error);
  }
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
  Notify.failure(error.message);
}

function addButtonLoadMore() {
  loadMoreEl.addEventListener('click', onLoadMoreClick);
}

async function onLoadMoreClick() {
  page += 1;
  if (page > totalPage) {
    loadMoreEl.classList.remove('load-more-show');
  }
  try {
    const { data } = await fetchImages(searchName, IMAGE_PER_PAGE, page);

    await onFetchSuccess(data);
    await smoothScroll();
    await gallerySLBox.refresh();
  } catch (error) {
    onFetchError(error);
  }
}

async function loadMoreWithScroll() {
  loadMoreEl.classList.remove('load-more-show');

  if (page > totalPage) {
    return;
  }
  page += 1;
  try {
    const { data } = await fetchImages(searchName, IMAGE_PER_PAGE, page);

    await onFetchSuccess(data);
    await gallerySLBox.refresh();
  } catch (error) {
    onFetchError(error);
  }
}

function smoothScroll() {
  const { height: cardHeight } =
    galleryEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function addIntersectionObserver() {
  const options = {
    rootMargin: '5px',
    threshold: 1.0,
  };
  const observer1 = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (page > totalPage) {
          Notify.info('Вибачте, але ви досягли кінця результатів пошуку.');
        }
        if (infiniteScrollEl.checked) {
          loadMoreWithScroll();
        }
      }
    });
  }, options);

  observer1.observe(document.querySelector('.scroll-guard'));
}
