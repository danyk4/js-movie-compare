const url = 'https://www.omdbapi.com';
const apiKey = 'youkey';

const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
    return `
      <img src="${imgSrc}" />
      ${movie.Title} (${movie.Year})
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await fetch(`${url}?apikey=${apiKey}&s=${searchTerm}`)
      .then((response) => response.json());

    if (response.Error) {
      return [];
    }

    return response.Search;
  }
};

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
  }
});
createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
  }
});

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await fetch(`${url}?apikey=${apiKey}&i=${movie.imdbID}`)
    .then((response) => response.json());

  summaryElement.innerHTML = movieTemplate(response);

  if (side === 'left') {
    leftMovie = response;
  } else {
    rightMovie = response;
  }

  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = () => {
  const leftSideStats = document
    .querySelectorAll('#left-summary .notification');
  const rightSideStats = document
    .querySelectorAll('#right-summary .notification');

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftSideValue = +leftStat.dataset.value;
    const rightSideValue = +rightStat.dataset.value;

    console.log(leftSideValue + '  ', rightSideValue);

    if (rightSideValue > leftSideValue) {
      console.log('right more than left');
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
    } else {
      console.log('left more than right');
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
    }
  });
};

const movieTemplate = (movieDetail) => {
  let dollars = 0;
  if (movieDetail.BoxOffice) {
    dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '')
      .replace(/,/g, ''));
    if (isNaN(dollars)) {
      dollars = 0;
    }
  }
  const metascore = isNaN(parseInt(movieDetail.Metascore)) ? 0 :
    parseInt(movieDetail.Metascore);
  const imdbRating = isNaN(parseFloat(movieDetail.imdbRating)) ? 0 :
    parseFloat(movieDetail.imdbRating);
  let imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
  if (isNaN(imdbVotes)) {
    imdbVotes = 0;
  }

  let awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
    const value = parseInt(word);

    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);

  if (isNaN(awards)) {
    awards = 0;
  }

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" alt="" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};
