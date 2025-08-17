const pokemonCache = new Map();
let pokemonCollection = [];
let limit = 20;
let currentOffset = 0;
let tripletStartIndex = 0;
let isLoading = false;
let allPokemons;

async function init() {
  showSpinner();
  hideBtnLoadMore();
  await loadData();
  allPokemons = await loadPage(1302);
  hideSpinner();
  showBtnLoadMore();
}

function getApiUrl() {
  return 'https://pokeapi.co/api/v2/pokemon?limit=' + limit + '&offset=' + currentOffset;
}

async function loadData(isSearch = false, filteredData = null) {
  let pokemonList = [];

  if (!isSearch) {
    pokemonList = await loadPage();
    await getPokemonCollection(pokemonList, isSearch);
  } else {
    await getPokemonCollection(filteredData, isSearch);
  }
}

function showSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'flex';
}

function hideSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'none';
}

async function loadPage(searchParam) {
  let response;
  if (!searchParam) {
     response = await fetch(getApiUrl());
  }else {
    response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=' + searchParam);
  }
    const data = await response.json();
    return data.results;
}

async function getPokemonCollection(pokemonList, isSearch) {
  if (isSearch) {
    pokemonCollection = [];
  }

  // Fetch all details in parallel for speed
  const details = await Promise.all(
    pokemonList.map(async (pokemon) => {
      const detailsResponse = await fetch(pokemon.url);
      return await detailsResponse.json();
    })
  );

  pokemonCollection.push(...details);

  // Wait until render (including images) is done
  await renderPokemon(pokemonCollection);
}

async function showMorePokemon() {
  showSpinner();
  disableBtnLoadMore();
  currentOffset += limit;

  await new Promise(resolve => setTimeout(resolve, 1000));
  await loadData();
  
  if (currentOffset == 1282) {
    hideBtnLoadMore()
  }
  hideSpinner();
  enableBtnLoadMore()
}

function hideBtnLoadMore() {
  const btnLoadMore = document.getElementById('loadMoreButton');
  btnLoadMore.style.display = 'none';
}

function showBtnLoadMore() {
  const btnLoadMore = document.getElementById('loadMoreButton');
  btnLoadMore.style.display = 'flex';
}

function disableBtnLoadMore() {
  const btnLoadMore = document.getElementById('loadMoreButton');
  btnLoadMore.disabled = true;
}

function enableBtnLoadMore() {
  const btnLoadMore = document.getElementById('loadMoreButton');
  btnLoadMore.disabled = false;
}

function toggleOverlay() {
  const overlay = document.getElementById('detailsContainer');
  if (overlay.style.display === 'flex') {
    closeOverlay();
  } else {
    openOverlay();
  }
}

function closeOverlay() {
  const overlay = document.getElementById('detailsContainer');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

function openOverlayByName(name) {
  const index = pokemonCollection.findIndex(p => p.name === name);
  if (index !== -1) {
    openOverlay(index);
  }
}

async function search() {
  showSpinner();
  const input = document.getElementById('search').value.toLowerCase().trim();
  const container = document.getElementById('pokedex');
  if (!input || input.length <= 2) { alert('Enter more than 2 letters'); hideSpinner(); return; }

  let pokemonList = allPokemons.filter(p => p.name.startsWith(input));

  if (pokemonList.length === 0) { pokemonList = await getPokemonsByType(input); }

  container.innerHTML = '';
  hideBtnLoadMore();

  await loadData(true, pokemonList);   // wait for fetch + render (incl. images)
  hideSpinner();
}

async function getPokemonsByType(type) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.pokemon.map(p => p.pokemon);
  } catch (err) {
    console.error(err);
    return [];
  }
}

function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function openOverlay(index) {
  const overlay = document.getElementById('detailsContainer');
  const pokemon = pokemonCollection[index];
  const species = await getFetchPokemonSpecies(pokemon);

  overlay.dataset.currentIndex = index;
  overlay.style.display = 'flex';
  document.body.classList.add('no-scroll');
  overlay.innerHTML = renderOverlay(pokemon, index, species);
  renderEvolutionChain(species, index);
}

function renderPokeSheet(pokemon, index, species) {
  return `
        <div class="poke-sheet">
            ${getTabListPokeSheet(index)}
            ${getTabContent(pokemon, index, species)}
        `
}

async function getFetchPokemonSpecies(pokemon) {
  const speciesRes = await fetch(pokemon.species.url);
  return await speciesRes.json();
}

function renderPokemonDetails(pokemon) {
  const detailsContainer = document.getElementById('detailsContainer');
  detailsContainer.innerHTML = '';
  detailsContainer.innerHTML += getCardTemplate(pokemon);
}

function renderStats(stats) {
  let html = '';
  for (const s of stats) {
    const label = statLabel(s.stat.name);
    const val = s.base_stat;
    const color = bsProgressColor(s.stat.name);
    const pct = (val * 100) / 100;

    html += getStatsTemplate(label, color, pct, val);
  }
  return html;
}

async function renderEvolutionChain(species, index) {
  const containerId = `evolutionContainer-${index}`;
  const container = document.getElementById(containerId);
  const response = await fetch(species.evolution_chain.url);
  const evolutions = await response.json();
  const allEvolutions = getEvolutions(evolutions.chain);
  const evoImages = await getEvoImages(allEvolutions);
  container.innerHTML = getEvolutionTemplate(evoImages);
}

async function getEvoImages(allEvolutions) {
  return await Promise.all(
    allEvolutions.map(async evo => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo.name}`);
        const data = await res.json();
        return {
          name: evo.name,
          img: data.sprites.other['official-artwork'].front_default || data.sprites.front_default || '',
        };
      } catch { return { name: evo.name, img: '' }; }
    })
  );
}

function getEvolutions(chain) {
  let evolutions = [{ name: chain.species.name, url: chain.species.url }];
  for (let evo of chain.evolves_to) {
    evolutions = evolutions.concat(getEvolutions(evo));
  }
  return evolutions;
}

async function renderPokemon(pokemonCollection) {
  const container = document.getElementById('pokedex');
  let html = "";
  for (const pokemon of pokemonCollection) { html += getStartTemplate(pokemon); }
  container.innerHTML = html;
  const imgs = Array.from(container.querySelectorAll('img'));
  if (imgs.length === 0) return;
  await Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => { img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })
  );
}

function getPokemonTypes(pokemon) {
  const types = pokemon.types.map(t => t.type.name);
  return types.map(type => `<span class="type-badge type-${type}">${type}</span>`).join(' ');
}

function getPokemonTypeKeys(pokemon) {
  return pokemon.types.map(t => t.type.name);
}

function getPokemonImages(pokemon) {
  return pokemon.sprites.other['official-artwork'].front_default;
}

function formatGender(genderRate) {
  if (genderRate === -1) return 'Geschlechtslos';
  const female = Math.round((genderRate / 8) * 1000) / 10;
  const male = Math.round((100 - female) * 10) / 10;
  return `♂ ${male}% – ♀ ${female}%`;
}

function formatEggGroups(groups) {
  if (!groups || !groups.length) return '—';
  return groups.map(g => capitalizeFirstLetter(g.name)).join(', ');
}

function formatEggCycle(hatchCounter) {
  if (hatchCounter == null) return '—';
  const cycles = hatchCounter;
  const steps = (hatchCounter + 1) * 255;
  return `${cycles} Zyklen (~${steps.toLocaleString()} Schritte)`;
}

function statLabel(key) {
  const map = {
    hp: 'HP', attack: 'Attack', defense: 'Defense',
    'special-attack': 'Sp. Atk', 'special-defense': 'Sp. Def', speed: 'Speed'
  };
  return map[key] || key;
}

function bsProgressColor(statKey) {
  switch (statKey) {
    case 'hp': return 'bg-danger';
    case 'attack': return 'bg-warning';
    case 'defense': return 'bg-success';
    case 'special-attack': return 'bg-info';
    case 'special-defense': return 'bg-primary';
    case 'speed': return 'bg-secondary';
    default: return 'bg-dark';
  }
}

function moveBack() {
  const overlay = document.getElementById('detailsContainer');
  let currentIndex = parseInt(overlay.dataset.currentIndex, 10);
  if (isNaN(currentIndex)) return;

  currentIndex = (currentIndex - 1 + pokemonCollection.length) % pokemonCollection.length;
  openOverlay(currentIndex);
}

function moveForward() {
  const overlay = document.getElementById('detailsContainer');
  let currentIndex = parseInt(overlay.dataset.currentIndex, 10);
  if (isNaN(currentIndex)) return;

  currentIndex = (currentIndex + 1) % pokemonCollection.length;
  openOverlay(currentIndex);
}