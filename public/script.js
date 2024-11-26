// html elements
const input = document.getElementById("domain-input");
const resultDiv = document.getElementById("ip-result");
const form = document.getElementById('form');
const ipAddressHolder = document.getElementById('ip-address');
const domainHolder = document.getElementById('domain');
const errorDiv = document.getElementById('error');

// resolve domain name input to IP address upon form submission
form.addEventListener('submit', (event) => {
    event.preventDefault(); // don't refresh page
    const domain = input.value;
    input.value = ""; // clear input box

    // Make request to the backend with domain as query parameter
    fetch(`/resolve?domain=${encodeURIComponent(domain)}`)
      .then(response => response.json())
      .then(data => {
        // show/hide error and result based on if an error exists
        if (data.error) {
          console.error(data.error);
          errorDiv.innerText = data.error;
          resultDiv.classList.add("hidden");
          errorDiv.classList.remove("hidden");
        }
        else {
          domainHolder.innerText = data.domain;
          ipAddressHolder.innerText = data.ip;
          resultDiv.classList.remove("hidden");
          errorDiv.classList.add("hidden");
        }
      });
});