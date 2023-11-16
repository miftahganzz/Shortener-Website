let filterOption = 'all';

document.addEventListener('DOMContentLoaded', function() {
  const storedShortUrls = getStoredShortUrls();
  renderShortUrlList(storedShortUrls);
});

function shortenUrl() {
  const customInput = document.getElementById('customInput').value;
  const urlInput = document.getElementById('urlInput').value;

  let requestUrl = '/shorten';
  if (customInput) {
    requestUrl = `/${customInput}`;
  }

  fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: urlInput,
    }),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Custom name already exists');
      }
    })
    .then(data => {
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = `<p>Original URL: ${data.originalUrl}</p><p>Short URL: <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a></p>`;

      const storedShortUrls = getStoredShortUrls();
      storedShortUrls.push(data.shortUrl);
      setStoredShortUrls(storedShortUrls);

      renderShortUrlList(storedShortUrls);

      Swal.fire({
        icon: 'success',
        title: 'Short URL Created!',
        text: 'Your short URL has been successfully created.',
      });
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error.message,
      });
    });
}

function deleteShortUrl(shortUrl) {
  const storedShortUrls = getStoredShortUrls();
  const updatedShortUrls = storedShortUrls.filter(url => url !== shortUrl);
  setStoredShortUrls(updatedShortUrls);
  renderShortUrlList(updatedShortUrls);
}

function getStoredShortUrls() {
  return JSON.parse(localStorage.getItem('shortUrls')) || [];
}

function setStoredShortUrls(shortUrls) {
  localStorage.setItem('shortUrls', JSON.stringify(shortUrls));
}

function filterShortUrls(option) {
  filterOption = option;
  renderShortUrlList(getStoredShortUrls());
  document.querySelector('.dropdown-toggle').textContent = option.toUpperCase();
}

function renderShortUrlList(shortUrls) {
  const shortUrlListDiv = document.getElementById('shortUrlList');
  shortUrlListDiv.innerHTML = '';

  shortUrls.forEach(shortUrl => {
    if ((filterOption === 'url' && !shortUrl.includes('cn')) ||
      (filterOption === 'cn' && shortUrl.includes('cn')) ||
      filterOption === 'all') {
      const shortUrlItem = document.createElement('div');
      shortUrlItem.className = 'short-url-item';
      shortUrlItem.innerHTML = `<p>Short URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a></p><span class="delete-icon" onclick="deleteShortUrl('${shortUrl}')">&#10006;</span>`;
      shortUrlListDiv.appendChild(shortUrlItem);
    }
  });
}