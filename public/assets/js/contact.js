document.getElementById('contact-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(this);
  fetch('/send-email', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(data => {
      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: data,
      });
      document.getElementById('contact-form').reset();
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
    });
});