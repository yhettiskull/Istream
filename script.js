'use strict'

const twitchKey = 'zd7tl7hpt3cjzvj6cl9fask5plp5bu';

const twitchGameBase = 'https://api.twitch.tv/helix/games';
const twitchStreamsBase = 'https://api.twitch.tv/helix/streams';
const twitchUserBase = 'https://api.twitch.tv/helix/users';

const authHeader = {
    headers: new Headers ({
        "Client-ID": twitchKey
    })
};

const rawgBaseUrl = 'https://api.rawg.io/api/games/';

function refineInput(rawgName) {

    const nameArray = rawgName.toLowerCase().split(" ");

    const titleDate = nameArray.filter(index => index.includes('('));

    if (titleDate.length !== 0) {
        nameArray.pop();
        return nameArray.join(" ");
    }
    else {
        return nameArray.join(" ");
    }
};

function displayGameData(rawg) {
    $('.welcoming').addClass('hidden');
    $('#rawg-data-container').empty();

    $('#banner').empty();
    $('#banner').append(`<img id="game-banner" src="${rawg.background_image}">`);

    $('#rawg-data-container').append(
        `<section id="game-header">
            <h1 id="game-title"></h1>
            <span id="rating-container"></span>
            <span id="platforms">Available at:
                <ul id="stores-list"></ul>
            </span>
        </section>
        <span id="game-publishers">
            <b>
            Publisher: ${rawg.publishers[0].name}
            <br>
            Developer: ${rawg.developers[0].name}
            </b>
        </span>
        <div id="game-description">
            ${rawg.description}
        </div>`);

        if(rawg.website !== ""){
            $('#game-title').append(`<a href="${rawg.website}" target="_blank">${rawg.name_original}</a>`)
        }
        else{
            $('#game-title').text(`${rawg.name_original}`);
        }

        if(rawg.esrb_rating !== null) {
            $('#rating-container').append(`<h4>ESRB: ${rawg.esrb_rating.name}</h4>`);
        }
        else{
            $('#rating-container').append(`<h4>ESRB: N/A</h4>`);
        };

        if(rawg.meatcritic !== null) {
            $('#rating-container').append(`<h4>Metacritic score: ${rawg.metacritic}</h4>`);
        }
        else{
            $('#rating-container').append(`<h4>Metacritic score: N/A</h4>`);
        };

        for(let i = 0; i < rawg.stores.length; i++) {
            $('#stores-list').append(
                `<li>
                <a href="${rawg.stores[i].url}" target="_blank">${rawg.stores[i].store.name}</a>
                </li>`
            );
        };
};

function getGamesResults(input) {
    let rawgSearchUrl = `${rawgBaseUrl}${input}`;

    fetch(rawgSearchUrl)
        .then(rawgResponse => {
            if (rawgResponse.ok) {
                $('#err-container').empty();
                return rawgResponse.json();
                }
            throw new Error(rawgResponse.statusText);
            })
        .then(rawgResponseJson => {
            console.log(rawgResponseJson)
            displayGameData(rawgResponseJson)
            getTwitchGame(rawgResponseJson, authHeader)
        })
            .catch(error => {
                $('#err-container').text(
                    `Heck, we couldn't find your game. Review the Things We Need to ensure your search is valid.`);
                })
};

function getTwitchGame(rawgResponse, options) {
    const refinedInput = refineInput(rawgResponse.name);
    
    const gameUrl = `${twitchGameBase}?name=${refinedInput}`

    console.log(gameUrl);

    fetch(gameUrl, options)
        .then(gameResponse => {
            if (gameResponse.ok) {
                $('#err-container').empty();
                return gameResponse.json()
                }
            throw new Error(gameResponse.statusText)
            })
            .then(gameResponseJson => {
                console.log(gameResponseJson);
                getTwitchStreams(gameResponseJson, authHeader);
            })
                .catch(error => $('#err-container').text(`Oops, could not get your game from Twitch. Our bad cheif.`))

    console.log('getTwitchGame ran');

};

function getTwitchStreams(gameResponse, options) {
    const streamUrl = `${twitchStreamsBase}?game_id=${gameResponse.data[0].id}`

    console.log(streamUrl);

    fetch(streamUrl, options)
        .then(streamResponse => {
            if (streamResponse.ok) {
                return streamResponse.json()
                }
            throw new Error(streamResponse.statusText)
        })
            .then(streamResponseJson => {
                console.log(streamResponseJson);
                getTwitchUsers(streamResponseJson, authHeader);
            })
                .catch(error => {
                    $('#results-list').append(`Oh man, it looks like no one is streaming this game right now. Bummer.`);
                });
    console.log('getTwitchStreams ran.')
};

function getTwitchUsers(streamResponse, options) {
    $('.streamsHeader').removeClass('hidden');
    
    for(let i = 0; i <= 2; i++) {
    let usersUrl = `${twitchUserBase}?id=${streamResponse.data[i].user_id}`
    

    fetch(usersUrl, options)
        .then(usersResponse => {
            if(usersResponse.ok) {
                return usersResponse.json();
            }
            throw new Error(usersResponse.statusText)
        })
            .then(usersResponseJson => {
                console.log(usersResponseJson);
                displayResults(usersResponseJson);
            })
                .catch(error => $('#err-container').text(`Oops, we couldn't find Twitch users.`));
    };
};

function displayResults(userResponse) {

    $('#results-list').append(
        `<div class="profile">
        <img class="profileImage" src="${userResponse.data[0].profile_image_url}">
        <a class="profileLink" href="https://twitch.tv/${userResponse.data[0].display_name}" target="_blank">${userResponse.data[0].display_name}</a>
        <p class="profileDescription">${userResponse.data[0].description}</p>
        </div>`);
};

function watchForm() {
    $('#search-form').submit(event => {
        event.preventDefault();

        const userInput = $('#userSearch').val().split(" ").join("-");

        $('#results-list').empty();
        $('#userSearch').val('');
        getGamesResults(userInput);
    });
};

function getGameSuggestions(gameUrl, options) {
    const topGames = `${gameUrl}/top?first=3`;

    fetch(topGames, options)
        .then(suggestionResponse => {
            if(suggestionResponse.ok){
                return suggestionResponse.json();
            }
            throw new Error(suggestionResponse.statusText)
        })
            .then(suggestionResponseJson => {
                console.log(suggestionResponseJson)
                $('#game-suggestion-container').append(
                    `<li>${suggestionResponseJson.data[0].name}</li>
                    <li>${suggestionResponseJson.data[1].name}</li>
                    <li>${suggestionResponseJson.data[2].name}</li>`
                )
            })
                .catch(err => {
                    $('#game-suggestion-container').append(`Yikes, it looks like we couldn't find any!`);
                });
};

$(watchForm());
$(getGameSuggestions(twitchGameBase, authHeader))