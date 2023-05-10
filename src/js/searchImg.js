export function searchImg(name,imagePerPage, page) {
  const API_KEY = '36230302-a98b57dafca503e591043ee2d';

  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: name,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: imagePerPage,
    page: page,
  });

  const url = `https://pixabay.com/api/?${searchParams}`;

  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }

    return response.json();
  });
}
