const Limit = 18;
let currentOffset = 0;
const pokemonCollection = [];

function init() {
    loadData();
}

function getApiUrl() {
    return 'https://pokeapi.co/api/v2/pokemon?limit=' + Limit + '&offset=' + currentOffset;
    //https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0
}

async function loadData(isSearch = false, filteredData = null) {
    let pokemonList = [];
    let pokemonFilteres = [];

    if (!isSearch && !filteredData) {
        let response = await fetch(getApiUrl());
        data = await response.json();
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

function showMorePokemon() {
    currentOffset = currentOffset + Limit;
    loadData();
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
            <div class="card" onclick="toggleOverlay()" id=${name}>
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
            <div class="card" onclick="toggleOverlay()">
                <div class="card-header">${name}</div>
                <div class="card-body">
                    <blockquote class="blockquote mb-0">
                        <p><img src="${image}" alt="${altImage}" class="pokemonImg"></img></p>
                        <div><p>${typesHtml}</p></div>
                    </blockquote>
                </div>
            </div>
        `;
        }
    }
}
function toggleOverlay() {
    const overlay = document.getElementById('profileConteiner');
    if (overlay.style.display === 'flex') {
        closeOverlay();
    } else {
        openOverlay();
    }
}

function openOverlay() {
    const overlay = document.getElementById('detailsContainer');
    const name = pokemonCollection[pokemonNoEvolutionIndex].name;
    const image = pokemonCollection[pokemonNoEvolutionIndex].sprites.other['official-artwork'].front_default;
    const altImage = pokemonCollection[pokemonNoEvolutionIndex].name;
    const types = pokemonCollection[pokemonNoEvolutionIndex].types.map(t => t.type.name);
    const typesHtml = types
        .map(type => `<span class="type-badge type-${type}">${type}</span>`)
        .join(' ');
        
    overlay.style.display = 'flex';

    overlay.innerHTML += `

    <div class="card" id=${name}>
                <div class="card-header">${name}</div>
                <div class="card-body">
                    <blockquote class="blockquote mb-0">
                        <p><img src="${image}" alt="${altImage}" class="pokemonImg"></img></p>
                        <div><p>${typesHtml}</p></div>
                    </blockquote>
                </div>
            </div>
    `
}

function closeOverlay() {
    const overlay = document.getElementById('profileConteiner');
    overlay.style.display = 'none';
    overlay.innerHTML = '';
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