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

function getGamesResults(input) {
    let rawgSearchUrl = `${rawgBaseUrl}${input}`;

    fetch(rawgSearchUrl)
        .then(rawgResponse => {
            if (rawgResponse.ok) {
                return rawgResponse.json();
            }
            throw new Error(rawgResponse.statusText);
        })
        .then(rawgResponseJson => {
            console.log(rawgResponseJson)
            getTwitchGame(rawgResponseJson, authHeader)
        })
            .catch(error => alert('Oops, could not fetch RAWG.'))

    
};

function getTwitchGame(rawgResponse, options) {
    const refinedInput = refineInput(rawgResponse.name);
    
    const gameUrl = `${twitchGameBase}?name=${refinedInput}`

    console.log(gameUrl);

    fetch(gameUrl, options)
        .then(gameResponse => {
            if (gameResponse.ok) {
                return gameResponse.json()
                }
            throw new Error(gameResponse.statusText)
            })
            .then(gameResponseJson => {
                console.log(gameResponseJson);
                getTwitchStreams(gameResponseJson, authHeader);
            })
                .catch(error => alert('Oops, could not fetch Game.'))

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
                .catch(error => alert('Oops, could not fetch Streams.'));
    console.log('getTwitchStreams ran.')
};

function getTwitchUsers(streamResponse, options) {
    
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
                .catch(error => alert(`Oops, could not fetch Users at ${i}.`));
    }
};

function displayResults(userResponse) {

    $('#results-list').append(`<h3><a href="https://twitch.tv/${userResponse.data[0].display_name}">${userResponse.data[0].display_name}</a></h3>`);
};

function watchForm() {
    $('#search-form').submit(event => {
        event.preventDefault();

        const userInput = $('#userSearch').val().split(" ").join("-");

        $('#results-list').empty();
        getGamesResults(userInput);
    });
};

$(watchForm());