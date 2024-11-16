const searchInput = document.getElementById('search-input');
const searchDateTime = document.getElementById('search-date-time');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
searchBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const searchQuery = searchInput.value.trim();
  const searchDateTimeValue = searchDateTime.value;
  if (searchQuery && searchDateTimeValue) {
    try {
      const response = await fetch(`https://api.example.com/search?q=${searchQuery}&datetime=${searchDateTimeValue}`);
      const data = await response.json();
      const searchResultsHtml = '';
      data.forEach((result) => {
        searchResultsHtml += `
          <div class="search-result">
            <h3>${result.name}</h3>
            <p>${result.address}</p>
            <p>${result.distance} miles away</p>
          </div>
        `;
      });
      searchResults.innerHTML = searchResultsHtml;
    } catch (error) {
      console.error(error);
      searchResults.innerHTML = '<p>Error: unable to retrieve search results</p>';
    }
  } else {
    searchResults.innerHTML = '<p>Please enter a search query and date/time</p>';
  }
});