
// https://bugs.chromium.org/p/chromium/issues/detail?id=462542
// Taken from chrome extension::setIcon as there's a bug with paths not working right now
export default async function loadImagePathForServiceWorker(path, callback, failureCallback) {
  path = chrome.runtime.getURL(path);
  console.warn(path);
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error('Response from fetching icon not ok.');
  }

  const imageBlob = await response.blob();
  const image = await createImageBitmap(imageBlob);

  const canvas = new OffscreenCanvas(image.width, image.height);
  const canvasContext = canvas.getContext('2d');
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);

  return imageData;
}
