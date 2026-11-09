export const optimizeThumb = (url, w = 400) => {
  if (!url) return url;
  if (url.includes("images.unsplash.com")) {
    return `${url.split("?")[0]}?auto=format&fit=crop&w=${w}&q=75`;
  }
  return url;
};