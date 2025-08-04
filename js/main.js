const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=60";

const pokemonCollection = [];
let loadQuantity = 30;
let index = 1;

function init() {

    loadData();
    //showMorePokemon();
}


async function loadData() {

    let response = await fetch(BASE_URL);
    let data = await response.json();
    let pokemonList = data.results;

    if (index <= loadQuantity) {
        for (pokemon of pokemonList) {
            debugger
            console.log(index);

            let response = await fetch(pokemon.url);
            let pokemonDetails = await response.json();

            pokemonCollection.push(pokemonDetails);

            if (index % 3 === 0 && index <= loadQuantity) {
                const pokemonNoEvolutionIndex = pokemonCollection.length - 3;
                renderPokemon(pokemonCollection, pokemonNoEvolutionIndex);
            }
            index++;
        }
    }
}

function showMorePokemon() {
    // const totalPokemon = pokemonCollection.length / 3;

    // if (pokemonCollection.length / 3 < loadQuantity) {
    //     loadData(pokemonCollection.length + 21);
    // }
    // if (pokemonCollection.length >= 63) {
    //     loadData(63);
    // }
    loadQuantity += 21;
    loadData();
}


function renderPokemon(pokemonCollection, pokemonNoEvolutionIndex) {
    const container = document.getElementById('pokedex');
    const pokemon = pokemonCollection[pokemonNoEvolutionIndex];
    const types = pokemon.types.map(t => t.type.name);

    const typeIcons = types.map(type => {
        switch (type) {
            case 'fire': return '🔥';
            case 'water': return '💧';
            case 'grass': return '🌿';
            case 'electric': return '⚡';
            case 'poison': return '☠️';
            case 'ground': return '🌍';
            case 'flying': return '🕊️';
            case 'bug': return '🐛';
            case 'fairy': return '✨';
            case 'normal': return '⭐';
            default: return type;
        }
    }).join(' ');

    container.innerHTML += `
            <div class="card" onclick="toggleOverlay()">
                <div class="card-header">${pokemonCollection[pokemonNoEvolutionIndex].name}</div>
                <div class="card-body">
                    <blockquote class="blockquote mb-0">
                        <p><img src="${pokemonCollection[pokemonNoEvolutionIndex].sprites.other['official-artwork'].front_default}" alt="${pokemonCollection[pokemonNoEvolutionIndex].name}" class="pokemonImg"></img></p>
                        <footer class="blockquote-footer"><p>${typeIcons}</p></footer>
                    </blockquote>
                </div>
            </div>
        `;
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

function searchByType() {
    const inputField = document.getElementById('searchTypeField').value;
    const input = inputField.toLowerCase().trim();
    const container = document.getElementById('pokedex');
    container.innerHTML = '';

    if (input === '' || input === 'all') {
        for (let index = 0; index < pokemonCollection.length; index += 3) {
            renderPokemon(pokemonCollection, index);
        }
        return;
    }

    const filtered = pokemonCollection.filter(pokemon =>
        pokemon.types.some(t => t.type.name === input)
    );

    filtered.forEach(p => {
        const list = pokemonCollection.indexOf(p);
        renderPokemon(pokemonCollection, list);
    });
}
