import qs from "qs";

export function renderUrl(urlTemplate, params) {
  let tmpParams = Object.assign({}, params);
  const keys = Object.keys(tmpParams)
  let url = decodeURIComponent(urlTemplate).replace(/:(\w+)/g, (_, key) => {
    if (keys.includes(key)) {
      const value = tmpParams[key]
      delete tmpParams[key]
      return value
    }else{
      console.warn(`url template(${urlTemplate}) key ${key} not found in params`, params)
      return key
    }
  });

  url = new URL(url, window.location.origin);

  const queryParams = qs.parse(url.search, { ignoreQueryPrefix: true });
  const mergedParams = Object.assign(queryParams, tmpParams);
  url.search = qs.stringify(mergedParams, { arrayFormat: "brackets" });

  return url.toString()
}
