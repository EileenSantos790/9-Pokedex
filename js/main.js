
const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=20";

function init() {

    loadData();      
}

async function loadData() {
    
    let response = await fetch(BASE_URL);
    let data = await response.json();
    let pokemonList = data.results;

    console.log(pokemonList);


for (let pokemon of pokemonList) {

        let response = await fetch(pokemon.url);
        let pokemonDetails = await response.json();

        renderPokemon(pokemonDetails);
    }
}

function renderPokemon(pokemonDetails) {
    const container = document.getElementById('pokedex');
    
    container.innerHTML += `
        <div class="card">
            <div class="card-header">${pokemonDetails.name}</div>
            <div class="card-body">
                <blockquote class="blockquote mb-0">
                    <p><img src="${pokemonDetails.sprites.other['official-artwork'].front_default}" alt="${pokemonDetails.name}" class="pokemonImg"></img></p>
                    <footer class="blockquote-footer"><p>#${pokemonDetails.id}</p><cite title="Source Title">Source Title</cite></footer>
                </blockquote>
            </div>
        </div>
    `;
}

