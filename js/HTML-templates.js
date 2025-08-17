function getStartTemplate(pokemon) {
  return `
            <div class="card" onclick="openOverlay(${pokemon.id - 1})" id="${pokemon.name}">
                <div class="card-header">${pokemon.name}</div>
                <div class="card-body">
                    <blockquote class="blockquote mb-0">
                        <p><img src="${getPokemonImages(pokemon)}" alt="${pokemon.name}" class="pokemonImg"></img></p>
                        <div><p>${getPokemonTypes(pokemon)}</p></div>
                    </blockquote>
                </div>
            </div>
        `;
}

function renderOverlay(pokemon, index, species) {
  return `
    <div class="outsideOverlayCard" onclick="closeOverlay()">
        <div class="overlayCard" onclick="event.stopPropagation()">
            ${renderPokeHero(pokemon)}
            ${renderPokeSheet(pokemon, index, species)}
        </div>
    </div>
  `;
}

function renderPokeHero(pokemon) {
  const types = getPokemonTypeKeys(pokemon);
  const firstType = (types[0] || "normal").toLowerCase();
  return `<div class="poke-hero type-${firstType}">
                <button class="buttonDetails" onclick="closeOverlay()" aria-label="Close">✕</button>
                <h2>${capitalizeFirstLetter(pokemon.name)}</h2>
                <div class="badge-style">${getPokemonTypes(pokemon)}</div>
                <img src="${getPokemonImages(pokemon)}" alt="${capitalizeFirstLetter(pokemon.name)}" class="pokemonOverlayImg">
            </div>`
}

function nextPreviousButton() {
  return `
            <div class="overlay-nav mt-3 d-flex justify-content-between">
                <button class="btn btn-outline-secondary" onclick="moveBack()">← Previous</button>
                <button class="btn btn-outline-secondary" onclick="moveForward()">Next →</button>
            </div>`
}

function getTabAbout(pokemon, index) {
  return `
        <div class="tab-pane fade show active" id="about-${index}" role="tabpanel" aria-labelledby="about-tab-${index}">
            <div class="kv"><div class="k">Height</div><div class="v">${(pokemon.height / 10).toFixed(1)} m</div></div>
            <div class="kv"><div class="k">Weight</div><div class="v">${(pokemon.weight / 10).toFixed(1)} kg</div></div>
            <div class="kv"><div class="k">Abilities</div><div class="v">${pokemon.abilities.map(a => a.ability.name).join(', ')}</div></div>
            ${nextPreviousButton(index)}
        </div>
    `
}

function getTabBreeding(index, species) {
  return `
        <div class="tab-pane fade" id="breeding-${index}" role="tabpanel" aria-labelledby="breeding-tab-${index}">
            <div class="kv"><div class="k">Geschlecht</div><div class="v">${species ? formatGender(species.gender_rate) : '—'}</div></div>
            <div class="kv"><div class="k">Egg Groups</div><div class="v">${species ? formatEggGroups(species.egg_groups) : '—'}</div></div>
            <div class="kv"><div class="k">Egg Cycle</div><div class="v">${species ? formatEggCycle(species.hatch_counter) : '—'}</div></div>
        </div>
    `
}

function getTabStats(pokemon, index) {
  return `
        <div class="tab-pane fade" id="stats-${index}" role="tabpanel" aria-labelledby="stats-tab-${index}">
            <p>${renderStats(pokemon.stats)}</p>
        </div>
    `
}

function getTabListPokeSheet(index) {
  return `
        <ul class="nav nav-underline" role="tablist">
            <li class="nav-item"><a class="nav-link active" id="about-tab-${index}" data-bs-toggle="tab" href="#about-${index}" role="tab" aria-controls="about-${index}" aria-selected="true">About</a></li>
            <li class="nav-item"><a class="nav-link" id="breeding-tab-${index}" data-bs-toggle="tab" href="#breeding-${index}" role="tab" aria-controls="breeding-${index}" aria-selected="false">Breeding</a></li>
            <li class="nav-item"><a class="nav-link" id="stats-tab-${index}" data-bs-toggle="tab" href="#stats-${index}" role="tab" aria-controls="stats-${index}" aria-selected="false">Base stats</a></li>
            <li class="nav-item"><a class="nav-link" id="evolution-tab-${index}" data-bs-toggle="tab" href="#evolution-${index}" role="tab" aria-controls="evolution-${index}" aria-selected="false">Evolution</a></li>
        </ul>`
}

function getCardTemplate(pokemon) {
  return `
        <div class="card">
            <div class="card-header">${pokemon.name}</div>
            <div class="card-body">
                <blockquote class="blockquote
                mb-0">
                        <p><img src="${getPokemonImages(pokemon)}" alt="${pokemon.name}" class="pokemonImg"></p>
                        <div><p>${getPokemonTypes(pokemon)}</p></div>
                </blockquote>
            </div>
        </div>
    `;
}

function getTabContent(pokemon, index, species) {
  return `
        <div class="tab-content mt-3">
                ${getTabAbout(pokemon, index)}
                ${getTabBreeding(index, species)}
                ${getTabStats(pokemon, index)}
                  <div class="tab-pane fade" id="evolution-${index}" role="tabpanel" aria-labelledby="evolution-tab-${index}">
                  <div id="evolutionContainer-${index}"></div>
                ${nextPreviousButton(index)}
                </div>
            </div>
        </div>
`
}

function getStatsTemplate(label, color, pct, val) {
  return `
        <div class="row align-items-center gy-2">
            <div class="col-4 col-sm-3 col-md-2 fw-semibold">${label}</div>
            <div class="col">
            <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar ${color}" style="width:${pct}%">${val}</div>
            </div>
            </div>
        </div>
    `
}

function getEvolutionTemplate(evoImages) {
  let html = `<div class="evo-row">`;
  evoImages.forEach((evo, idx) => {
    html += `<div class="evo-col">
                <div class="evo-card" onclick="openOverlayByName('${evo.name}')">
                    <img src="${evo.img}" alt="${capitalizeFirstLetter(evo.name)}">
                    <div class="evo-name">${capitalizeFirstLetter(evo.name)}</div>
                </div>
            </div>
        `;
    if (idx < evoImages.length - 1) {let arrow = window.matchMedia("(max-width: 450px)").matches ? "&#8595" : "&#8594"; html += `<div class="evo-arrow">${arrow}</div>`;}
  });
  html += `</div>`;
  return html;
}

