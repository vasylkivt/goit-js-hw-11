export function createLiMarkup({
  largeImageURL,
  webformatURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
    <li class="gallery-photo-card">
      <a class="gallery-link" href="${largeImageURL}">
        <img
          loading="lazy"
          class="gallery-image"
          src="${webformatURL}" 
          alt="${tags || 'Image'}" />
          <div class="photo-card-info">
            <p class="photo-card-info-item">
              <b>Likes</b>
              ${likes}
            </p>
            <p class="photo-card-info-item">
              <b>Views</b>
              ${views}
            </p>
            <p class="photo-card-info-item">
              <b>Comments</b>
              ${comments}
            </p>
            <p class="photo-card-info-item">
              <b>Downloads</b>
              ${downloads}
            </p>
        </div>

      </a>
    </li>`;
}
