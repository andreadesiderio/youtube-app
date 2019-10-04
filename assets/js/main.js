'use strict'
 const playlistEndpoint = '/playlists';
// const channelId = 'UCCwuSfyX1D8yzdLFYAe1V8Q';
let playlistIdArr = ['PLWWwA08a1OR9570cEKm0dw-MG19E9ZCVA', 'PLWWwA08a1OR-Sruf_9UtGIVYdcTaIkmZz'];
const key = 'AIzaSyCK0Go8xquMoUGq1szMVeaHU5NcepoHwi4';
const baseUrl = 'https://www.googleapis.com/youtube/v3';
const playlistItemEndpoint = '/playlistItems';


function watchPlaylistForm(){
    $('#playlistForm').on('submit', function(event){
        event.preventDefault();
        const playlistIdInput = $('#playlistIdInput').val();
        $('.playlistsContainer').empty();
        $('.playlistItemsContainer').empty();
        playlistIdArr.push(playlistIdInput);
        fetchUrl(playlistIdArr, playlistEndpoint);
    })
}


function queryString(playlistId, endpoint){
    let params = {
        key : key,
        part : "snippet"
    };
    if (endpoint == playlistEndpoint){
        params.id = playlistIdArr;
    }
    if (endpoint == playlistItemEndpoint){
        params.playlistId = playlistId;
    }
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}


function fetchUrl(id, endpoint){
    console.log("id: " + id);
    const url = baseUrl + endpoint + '?' + queryString(id, endpoint);
    console.log("url:" + url);
    fetch(url)
    .then(response => {
        if (response.ok){
        return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(error => console.log(error.message))
}



function displayResults(responseJson){
    if (responseJson.kind == 'youtube#playlistListResponse'){
        for (let i = 0; i < responseJson.items.length; i++){
            let item = responseJson.items[i];
            let playlistId = item.id
            $('.playlistsContainer').append(
            `<li class="playlist" id="${playlistId}">
            <h3>${item.snippet.title}</h3>
            <img src="${item.snippet.thumbnails.default.url}" alt="img"/>
            </li>`
            );
        }    
        $('.playlistsContainer').on('click', '.playlist', function(){
            event.stopPropagation();
            let playlistId = $(this).attr('id');
            fetchUrl(playlistId, playlistItemEndpoint);
        });
    }
    if (responseJson.kind == 'youtube#playlistItemListResponse'){
        for(let i = 0 ; i < responseJson.items.length; i ++){
            let item = responseJson.items[i];
            let videoId = item.snippet.resourceId.videoId;
            $('.playlistItemsContainer').append(`<li class="playlistItem" id='${videoId}'>
            <a href="#video">
                <h4>${item.snippet.title}</h4>
                <img src='${item.snippet.thumbnails.default.url}' alt="img">
                <ul class="timeStampList">
                    <li class="timeStampItem">
                    <p class="timeStamp"><span class="min">3</span>:<span class="sec">45</span> - <span class="message">Time stamp message</span></p>
                    </li>
                </ul>
            </a>
            </li>`);
        }
            $('.playlistItemsContainer').on('click', '.playlistItem', function(){
                event.stopPropagation();
                let videoId = $(this).attr('id');
                displayVideo(videoId, 0);
            });
    }
}


function displayVideo(videoId, seconds){
    $('#video').html(`
    <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?start=${seconds}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <form id="timeStampForm">
    <legend>Add a new time stamp</legend>
    <label for="minInput">Minute</label>
    <input type="number" id="minInput" class="minInput" placeholder="00"></input>
    <label for="secInput">Second</label>
    <input type="number" id="secInput" class="secInput" placeholder="00"></input>
    <label for="timeStampMessageInput">Notes</label>
    <input type="text" class="timeStampMessageInput" id="timeStampMessageInput" placeholder="This is a timestamp note">
    <button type="submit">Submit</button>
    </form>
    `);
    timeStampListener();
    watchForm(videoId);
}

function watchForm(videoId){
    $('#timeStampForm').on('submit', function(event){
        event.preventDefault();
        const min = $('.minInput').val();
        const sec = $('.secInput').val();
        const message = $('.timeStampMessageInput').val();
        const listItem = $('.playlistItemsContainer').find(`#${videoId}`);
        update(listItem, min, sec, message);
    })
}

function update(listItem, min, sec, message){
    let timeStampList = listItem.find('.timeStampList');
    timeStampList.append(`<li class="timeStampItem">
    <p class="timeStamp"><span class="min">${min}</span>:<span class="sec">${sec}</span> - <span class="message">${message}</span></p>
    </li>
    `);
}

function timeStampListener(){
     $('.timeStampList').on('click', '.timeStampItem', function(event){
        event.stopPropagation();
        const videoId = $(this).closest('.playlistItem').attr('id');
        const min = Number($(this).find('.min').html());
        const sec = Number($(this).find('.sec').html());
        const totalSec = ( 60 * min) + sec;
        displayVideo(videoId, totalSec);
    });
}


$(function onload(){
    watchPlaylistForm();
    fetchUrl(playlistIdArr, playlistEndpoint);
}); 



