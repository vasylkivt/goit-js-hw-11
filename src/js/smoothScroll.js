export function smoothScroll(element) {
  const { height: cardHeight } = element.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 1.9,
    behavior: 'smooth',
  });
}
