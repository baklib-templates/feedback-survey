export function getMaxZIndex() {
  return parseInt(document.getElementsByTagName('html')[0].style.getPropertyValue('--max-z-index')) || 1000;
}

export function setMaxZIndex(zIndex) {
  document.getElementsByTagName('html')[0].style.setProperty('--max-z-index', zIndex)
  return zIndex
}

export const increaseMaxZIndex = function() {
  return setMaxZIndex(getMaxZIndex() + 1);
}

export const decreaseMaxZIndex = function() {
  return setMaxZIndex(getMaxZIndex() - 1);
}

