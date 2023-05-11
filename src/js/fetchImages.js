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
