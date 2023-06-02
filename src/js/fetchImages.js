import axios from 'axios';
axios.defaults.baseURL = 'https://pixabay.com/api';

const API_KEY = '36230302-a98b57dafca503e591043ee2d';

export const fetchImages = async (name, imagePerPage, page) => {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: name,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: imagePerPage,
    page: page,
  });

  return await axios.get(`/?${searchParams}`);
};

// class PixabayAPI {
//   #BASE_URL = 'https://pixabay.com/api';
//   #API_KEY = '36230302-a98b57dafca503e591043ee2d';
//   #BASE_SEARCH_PARAMS = {
//     key: this.#API_KEY,
//     image_type: 'photo',
//     orientation: 'horizontal',
//     safesearch: true,
//   };

//   constructor({ perPage = 20 } = {}) {
//     this.per_page = perPage;
//   }

//   async fetchImages() {
//     const searchParams = new URLSearchParams(...this);
//     console.log('searchParams:', searchParams);

//     return await axios.get(`${this.#BASE_URL}/?${searchParams}`);
//   }
// }

// const inst = new PixabayAPI({ per_page: 40 });

// console.dir(inst);
