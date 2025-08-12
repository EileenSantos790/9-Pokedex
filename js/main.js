const Limit = 18;
let currentOffset = 0;
let tripletStartIndex = 0;
const pokemonCollection = [];
let isLoading = false;


function init() {
    loadData();
}

function getApiUrl() {
    return 'https://pokeapi.co/api/v2/pokemon?limit=' + Limit + '&offset=' + currentOffset;
    //https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0
}

async function loadData(isSearch = false, filteredData = null) {

    await sleep(150);

    let pokemonList = [];
    let pokemonFilteres = [];

    if (!isSearch && !filteredData) {
        let response = await fetch(getApiUrl());
        let data = await response.json();
        pokemonList = data.results;
    } else {
        pokemonList = filteredData;
    }

    for (let [index, pokemon] of pokemonList.entries()) {
        index++
        let detailsResponse = await fetch(pokemon.url);
        let pokemonDetails = await detailsResponse.json();

        pokemonCollection.push(pokemonDetails);

        if (index % 3 === 0 && !filteredData) {
            const pokemonNoEvolutionIndex = pokemonCollection.length - 3;
            renderPokemon(pokemonCollection, pokemonNoEvolutionIndex);
        } else if (filteredData) {
            pokemonFilteres.push(pokemonDetails);
            renderPokemon(pokemonFilteres, null);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function showMorePokemon() {
    if (isLoading) return;
    isLoading = true;
    currentOffset = currentOffset + Limit;
    const loadPokemon = document.getElementById('loadMoreContainer');
    const loadMoreBtn = document.getElementById('loadMoreButton');
    if (loadMoreBtn) loadMoreBtn.disabled = true;

    if (!document.getElementById('loadingSpinner')) {
        loadPokemon.style.display = 'flex';
        loadPokemon.innerHTML = `
            <div id="loadingSpinner" class="spinner-border" role="status">
                <span class="sr-only"></span>
            </div>
        `;
    }

    try {
        if (currentOffset < 72) {
            await loadData();
        } else {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }
    } finally {

        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.remove();
        loadPokemon.style.display = 'none';

        if (loadMoreBtn) loadMoreBtn.disabled = false;
        isLoading = false;
    }
}

function renderPokemon(pokemonCollection, pokemonNoEvolutionIndex) {
    const container = document.getElementById('pokedex');
    const pokemon = pokemonCollection[pokemonNoEvolutionIndex] || pokemonCollection;

    if (pokemonNoEvolutionIndex !== null) { // Carregamento inicial
        const name = pokemonCollection[pokemonNoEvolutionIndex].name;
        const image = pokemonCollection[pokemonNoEvolutionIndex].sprites.other['official-artwork'].front_default;
        const altImage = pokemonCollection[pokemonNoEvolutionIndex].name;
        const types = pokemonCollection[pokemonNoEvolutionIndex].types.map(t => t.type.name);
        const typesHtml = types
            .map(type => `<span class="type-badge type-${type}">${type}</span>`)
            .join(' ');

        container.innerHTML += `
            <div class="card" onclick="openOverlay(${pokemonNoEvolutionIndex})" id="${name}">
                <div class="card-header">${name}</div>
                <div class="card-body">
                    <blockquote class="blockquote mb-0">
                        <p><img src="${image}" alt="${altImage}" class="pokemonImg"></img></p>
                        <div><p>${typesHtml}</p></div>
                    </blockquote>
                </div>
            </div>
        `;
    } else { // Busca por tipo
        container.innerHTML = ''; // limpar html
        for (const pokemon of pokemonCollection) {
            console.log(pokemon.name);
            const name = pokemon.name;
            const image = pokemon.sprites.other['official-artwork'].front_default;
            const altImage = pokemon.name;
            const types = pokemon.types.map(t => t.type.name);
            const typesString = types.join(', ');
            const typesHtml = types
                .map(type => `<span class="type-badge type-${type}">${type}</span>`)
                .join(' ');


            container.innerHTML += `
            <div class="card" class="cardDetails" onclick="openOverlayByName('${name}')">
                <div class="card-header">${name}</div>
                <div class="card-body">
                    <blockquote class="blockquote mb-0">
                        <p><img src="${image}" alt="${altImage}" class=""></img></p>
                        <div><p>${typesHtml}</p></div>
                    </blockquote>
                </div>
            </div>
        `;
        }
    }
}






function toggleOverlay() {
    const overlay = document.getElementById('detailsContainer');
    if (overlay.style.display === 'flex') {
        closeOverlay();
    } else {
        openOverlay();
    }
}

function openOverlay(index) {
    const overlay = document.getElementById('detailsContainer');
    const pokemon = pokemonCollection[index];

    const name = capitalizeFirstLetter(pokemon.name);
    const image = pokemon.sprites.other['official-artwork'].front_default;
    const types = pokemon.types.map(t => t.type.name);
    const typesHtml = types.map(type => `<span class="type-badge type-${type}">${type}</span>`).join(' ');
    const primaryType = types[0];

    const id = pokemon.id;
    const uid = `p${id}`;
    const aboutId = `about-${uid}`;
    const breedingId = `breeding-${uid}`;
    const statsId = `stats-${uid}`;
    const evolutionId = `evolution-${uid}`;

    overlay.style.display = 'flex';
    document.body.classList.add('no-scroll');

    overlay.innerHTML = `
    <div class="overlayCard">
    
        <div class="poke-hero type-${primaryType}">
            <button class="buttonDetails" onclick="closeOverlay()" aria-label="Close">✕</button>
            <h2>${name}</h2>
            <div class="type-badges">${typesHtml}</div>
            <img src="${image}" alt="${name}" class="pokemonOverlayImg">
        </div>

        <div class="poke-sheet">
            <ul class="nav nav-underline" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="about-tab-${uid}" data-bs-toggle="tab" href="#${aboutId}" role="tab">About</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="breeding-tab-${uid}" data-bs-toggle="tab" href="#${breedingId}" role="tab">Breeding</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="stats-tab-${uid}" data-bs-toggle="tab" href="#${statsId}" role="tab">Base stats</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="evolution-tab-${uid}" data-bs-toggle="tab" href="#${evolutionId}" role="tab">Evolution</a>
                </li>
            </ul>

            <div class="tab-content mt-3">
                <div class="tab-pane fade show active" id="${aboutId}" role="tabpanel" aria-labelledby="about-tab-${uid}">
                    <div class="kv"><div class="k">Height</div><div class="v">${(pokemon.height / 10).toFixed(1)} m</div></div>
                    <div class="kv"><div class="k">Weight</div><div class="v">${(pokemon.weight / 10).toFixed(1)} kg</div></div>
                    <div class="kv"><div class="k">Abilities</div><div class="v">${pokemon.abilities.map(a => a.ability.name).join(', ')}</div></div>
                </div>
            </div>

            <div class="tab-pane fade" id="${breedingId}" role="tabpanel" aria-labelledby="breeding-tab-${uid}">
                <div class="kv"><div class="k">Gender</div><div class="v">♂ 87.5% – ♀ 12.5%</div></div>
                <div class="kv"><div class="k">Egg Groups</div><div class="v">Monster</div></div>
                <div class="kv"><div class="k">Egg Cycle</div><div class="v">Grass</div></div>
            </div>

            <div class="tab-pane fade" id="${statsId}" role="tabpanel" aria-labelledby="stats-tab-${uid}">
                <p>Basiswerte…</p>
            </div>

            <div class="tab-pane fade" id="${evolutionId}" role="tabpanel" aria-labelledby="evolution-tab-${uid}">
                <div id="evolutionContainer-${uid}"></div>
            </div>

        </div>
        
    </div>
  `;

//     renderEvolutionChain(pokemon);
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

async function searchByType() {
    const inputField = document.getElementById('searchTypeField').value;
    const input = inputField.toLowerCase().trim();
    const container = document.getElementById('pokedex');
    container.innerHTML = '';

    const response = await fetch("https://pokeapi.co/api/v2/type/" + input);
    const data = await response.json();
    const pokemonList = [];

    if (!input) {
        init();
        return;
    }

    for (let p of data.pokemon) {
        pokemonList.push(p.pokemon);
    }

    loadData(true, pokemonList);
}

function renderPokemonDetails(pokemon) {
    const detailsContainer = document.getElementById('detailsContainer');
    detailsContainer.innerHTML = '';

    const image = pokemon.sprites.other['official-artwork'].front_default;
    const altImage = pokemon.name;
    const types = pokemon.types.map(t => t.type.name);
    const typesHtml = types
        .map(type => `<span class="type-badge type-${type}">${type}</span>`)
        .join(' ');

    detailsContainer.innerHTML += `
        <div class="card">
            <div class="card-header">${name}</div>
            <div class="card-body">
                <blockquote class="blockquote
                mb-0">
                        <p><img src="${image}" alt="${altImage}" class="pokemonImg"></p>
                        <div><p>${typesHtml}</p></div>
                </blockquote>
            </div>
        </div>
    `;
}

function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}



function renderEvolutonChain(pokemonCollection) {
    const evolutionContainer = document.getElementById('evolutionContainer');
    let evolutionofPokemon =

        evolutionContainer.innerHTML += `
        <div>
            <p>Evolutions</p>
            <div></div>
        </div>
    
    `;


}