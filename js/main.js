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
    const types = pokemon.types.map(t => t.type.name);

    // const typeIcons = types.map(type => {
    //     switch (type) {
    //         case 'fire': return 'Feuer';
    //         case 'water': return 'Wasser';
    //         case 'grass': return 'Grass';
    //         case 'electric': return 'Elektrik';
    //         case 'poison': return 'Gift';
    //         case 'ground': return 'Erde';
    //         case 'flying': return 'Flug';
    //         case 'bug': return 'Käfer';
    //         case 'fairy': return 'Fee';
    //         case 'normal': return 'Normal';
    //         case 'fighting': return 'Kampf';
    //         case 'psychic': return 'Psycho';
    //         case 'rock': return 'Gestein';
    //         case 'ghost': return 'Geist';
    //         case 'steel': return 'Stahl';
    //         case 'ice': return 'Eis';
    //         case 'dragon': return 'Drache';
    //         case 'dark': return 'Unlicht';
    //         case 'shadow': return 'Schatten';
    //         default: return type;
    //     }

    // }).join(' ');


    if (pokemonNoEvolutionIndex !== null) { // Carregamento inicial
        const name = pokemonCollection[pokemonNoEvolutionIndex].name;
        const image = pokemonCollection[pokemonNoEvolutionIndex].sprites.other['official-artwork'].front_default;
        const altImage = pokemonCollection[pokemonNoEvolutionIndex].name;

        container.innerHTML += `
            <div class="card" onclick="toggleOverlay()">
                <div class="card-header">${name}</div>
                <div class="card-body">
                    <blockquote class="blockquote mb-0">
                        <p><img src="${image}" alt="${altImage}" class="pokemonImg"></img></p>
                        <footer class="blockquote-footer"><p>ICONEEEE</p></footer>
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

            container.innerHTML += `
            <div class="card" onclick="toggleOverlay()">
                <div class="card-header">${name}</div>
                <div class="card-body">
                    <blockquote class="blockquote mb-0">
                        <p><img src="${image}" alt="${altImage}" class="pokemonImg"></img></p>
                        <footer class="blockquote-footer"><p>ICONEEEE</p></footer>
                    </blockquote>
                </div>
            </div>
        `;
        }
    }
}

function openOverlay() {
    const overlay = document.getElementById('profileConteiner');
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="overlay-content"><div class="pokemon-details"><h2>Pokémon Details</h2></div></div>
        <div class="secondOverlay" id="secondOverlay">
            <div class="secondOverlay-content p-3">
                <button onclick="closeOverlay()" type="button" class="btn-close" aria-label="Close"></button>
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="">Active</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Link</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Link</a>
                    </li>
                </ul>
            </div>
        </div>
    `;
}

function closeOverlay() {
    const overlay = document.getElementById('profileConteiner');
    overlay.style.display = 'none';
    overlay.innerHTML = '';
}

function toggleOverlay() {
    const overlay = document.getElementById('profileConteiner');
    if (overlay.style.display === 'flex') {
        closeOverlay();
    } else {
        openOverlay();
    }
}

function openSecondOverlay() {
    document.getElementById('secondOverlay').style.display = 'flex';
}

function closeSecondOverlay() {
    document.getElementById('secondOverlay').style.display = 'none';
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