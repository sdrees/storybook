export function browserSupportsCssZoom(): boolean {
  try {
    // First checks if Safari is being used, because Safari supports zoom, but it's buggy: https://developer.mozilla.org/en-US/docs/Web/CSS/zoom#browser_compatibility
    if (/safari/i.test(navigator.userAgent)) {
      return false;
    }

    // Next check if the browser supports zoom styling
    return global.CSS?.supports('zoom: 1');
  } catch (error) {
    return false;
  }
}
