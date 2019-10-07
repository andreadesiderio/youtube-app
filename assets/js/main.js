'use strict'
 
// const channelId = 'UCCwuSfyX1D8yzdLFYAe1V8Q';
let playlistIdArr = ['PLWWwA08a1OR9570cEKm0dw-MG19E9ZCVA', 'PLWWwA08a1OR-Sruf_9UtGIVYdcTaIkmZz'];
const key = 'AIzaSyCK0Go8xquMoUGq1szMVeaHU5NcepoHwi4';
const baseUrl = 'https://www.googleapis.com/youtube/v3';
const playlistItemEndpoint = '/playlistItems';
const playlistEndpoint = '/playlists';


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

function fetchUrl(id, endpoint, playlistsContainer){
    const url = baseUrl + endpoint + '?' + queryString(id, endpoint);
    fetch(url)
    .then(response => {
        if (response.ok){
        return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson, playlistsContainer))
    .catch(error => console.log(error.message))
}

function displayResults(responseJson, playlistsContainer){
    if (responseJson.kind == 'youtube#playlistListResponse'){
        for (let i = 0; i < responseJson.items.length; i++){
            let item = responseJson.items[i];
            let id = item.id
            playlistsContainer.append(
            `<li class="playlist" id="${id}">
            <h3 class="playlistCollectionItemTitle" id="${item.snippet.title}">${item.snippet.title}</h3>
            <img src="${item.snippet.thumbnails.default.url}" alt="img"/>
            </li>`
            );
        }    
    }
    if (responseJson.kind == 'youtube#playlistItemListResponse'){
        console.log(responseJson);
        for(let i = 0 ; i < responseJson.items.length; i ++){
            let item = responseJson.items[i];
            let videoId = item.snippet.resourceId.videoId;
            $('.playlistItemsContainer').append(`
            <li class="playlistItem" id='${videoId}'>
                <h4>${item.snippet.title}</h4>
                <div class='thumbnailAndTimestamps'>
                <a href="#videoContainer"><img src='${item.snippet.thumbnails.default.url}' class="videoThumbnail" alt="img"></a>
                <ul class="timeStampList"></ul>
                </a>
            </li>`);
        }      
    }
}

function watchFormOpener(playlistsContainer){
    $('.playlistFormToggler').on('click', function(event){
        event.stopPropagation();
        $('#playlistForm').removeClass('nodisplay');
        $('.playlistFormToggler').addClass('nodisplay');
        watchPlaylistAddForm(playlistsContainer);
    })
}

function watchPlaylistAddForm(playlistsContainer){
    watchPlaylistAddFormCloser();/// should this be on the bottom of the function?
    $('#playlistForm').on('submit', function(event){
        event.preventDefault();
        const playlistIdInput = $('#playlistIdInput').val();
        playlistsContainer.empty();
        $('.playlistItemsContainer').empty();
        playlistIdArr.push(playlistIdInput);
         $('#playlistForm').off('submit');
        $('#playlistIdInput').val("");
        $('#playlistForm').addClass('nodisplay');
        $('.playlistFormToggler').removeClass('nodisplay');
        fetchUrl(playlistIdArr, playlistEndpoint);
    })
}

function watchPlaylistAddFormCloser(){
    $('.playlistFormCloser').on('click', function(event){
        event.stopPropagation();
        event.preventDefault();
        $('#playlistForm').addClass('nodisplay');
        $('.playlistFormToggler').removeClass('nodisplay');
    })
}


function watchPlaylistClick(playlistsContainer){
    playlistsContainer.on('click', '.playlist', function(){
        event.stopPropagation();
        $('.playlistItemsContainer').empty();
        let title = $(this).find('.playlistCollectionItemTitle').attr('id');
        $('.playlistTitle').html(title);
         $('#playlistCollectionSection').addClass('nodisplay');
         $('#playlistVideosSection').removeClass('nodisplay');
        let playlistId = $(this).attr('id');
        watchPlaylistCollectionSection();//// shoould the be after fetchurl?
        fetchUrl(playlistId, playlistItemEndpoint);
    });
}

function watchPlaylistCollectionSection(){
    if ($('#playlistCollectionSection').hasClass('nodisplay')){
        $('#playlistCollectionSectionOpener').removeClass('nodisplay');
        $('#playlistCollectionSectionOpener').on('click', function(){
        $('#playlistCollectionSection').removeClass('nodisplay');
        $('#playlistCollectionSectionOpener').addClass('nodisplay');
        $('#playlistVideosSection').addClass('nodisplay');
        $('#videoPlayerSection').addClass('nodisplay');  
        })
    }
}

function watchItemClick(){
    $('.playlistItemsContainer').on('click', '.videoThumbnail', function(){
        event.stopPropagation();
        let videoId = $(this).closest('.playlistItem').attr('id');
        displayVideo(videoId, 0);
    });
}

function displayVideo(videoId, seconds){
    $('#playlistCollectionSection').addClass('nodisplay');
    $('#videoPlayerSection').removeClass('nodisplay'); 
    $('#videoContainer').html(`
    <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <form id="timeStampForm">
    <legend class="instructions">Add a new time stamp</legend>
    <label for="minInput">Minute</label>
    <input type="number" id="minInput" class="minInput" placeholder="00"></input>
    <label for="secInput">Second</label>
    <input type="number" id="secInput" class="secInput" placeholder="00"></input>
    <label for="timeStampMessageInput">Notes</label>
    <input type="text" class="timeStampMessageInput" id="timeStampMessageInput" placeholder="This is a timestamp note">
    <button type="submit">Submit</button>
    </form>
    `);
    watchTimeStampForm(videoId);
}

function watchTimeStampForm(videoId){
    $('#timeStampForm').on('submit', function(event){
        event.preventDefault();
        const min = $('.minInput').val();
        const sec = $('.secInput').val();
        const message = $('.timeStampMessageInput').val();
        const listItem = $('.playlistItemsContainer').find(`#${videoId}`);
        alert(`Timestamp: "${min}:${sec} - ${message}" has been added to your list`);
        $('#timeStampForm').children('input').val('');
        update(listItem, min, sec, message);
    })
}

function update(listItem, min, sec, message){
    let timeStampList = listItem.find('.timeStampList');
    timeStampList.append(`<li class="timeStampItem">
    <a href="#videoContainer"><p class="timeStamp"><span class="min">${min}</span>:<span class="sec">${sec}</span> - <span class="message">${message}</span></p></a>
    </li>
    `);
}

function watchTimeStampClick(){
        $('.playlistItemsContainer').on('click', '.timeStamp', function(event){
        event.stopPropagation();
        const videoId = $(this).closest('.playlistItem').attr('id');
        const min = Number($(this).find('.min').html());
        const sec = Number($(this).find('.sec').html());
        const totalSec = ( 60 * min) + sec;
        displayVideo(videoId, totalSec);
    });
}



$(function onload(){
        const playlistsContainer = $('.playlistsContainer');
        console.log(playlistsContainer);
    fetchUrl(playlistIdArr, playlistEndpoint, playlistsContainer);
    watchPlaylistClick(playlistsContainer);
    watchFormOpener(playlistsContainer);
    watchItemClick();
    watchTimeStampClick();///should this be here? 
}); 



