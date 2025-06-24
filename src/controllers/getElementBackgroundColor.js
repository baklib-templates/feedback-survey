const getDefaultBackgroundColor = function () {
  // have to add to the document in order to use getComputedStyle
  const div = document.createElement("div");
  document.head.appendChild(div);
  const bg = window.getComputedStyle(div).backgroundColor;
  document.head.removeChild(div);
  return bg;
};

export const getElementBackgroundColor = function (el, defaultBackgroundColor) {
  defaultBackgroundColor ||= getDefaultBackgroundColor(); // typically "rgba(0, 0, 0, 0)"

  // get computed color for el
  const backgroundColor = window.getComputedStyle(el).backgroundColor;

  // if we got a real value, return it
  if (backgroundColor != defaultBackgroundColor) return backgroundColor;

  // if we've reached the top parent el without getting an explicit color, return default
  if (!el.parentElement) return defaultBackgroundColor;

  // otherwise, recurse and try again on parent element
  return getElementBackgroundColor(el.parentElement);
};
