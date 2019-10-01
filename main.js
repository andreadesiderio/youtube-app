'use strict'
const key = 'AIzaSyCK0Go8xquMoUGq1szMVeaHU5NcepoHwi4';
const baseUrl = 'https://www.googleapis.com/youtube/v3';
const playlistEndpoint = '/playlists';
 const playlistItemEndpoint = '/playlistItems';
 let playlistId = ['PLWWwA08a1OR9570cEKm0dw-MG19E9ZCVA', 'PLWWwA08a1OR-Sruf_9UtGIVYdcTaIkmZz'];
 let playlistId = 'PLWWwA08a1OR9570cEKm0dw-MG19E9ZCVA';
const channelId = 'UCCwuSfyX1D8yzdLFYAe1V8Q';



function queryString(){
    let params = {
        key : key,
        part : "snippet",
        playlistId : playlistId
    };
    const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}


function fetchUrl(){
    const url = baseUrl + playlistItemEndpoint + '?' + queryString();
    console.log(url);
    fetch(url)
    .then(response => {
        if (response.ok){
        return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayPlaylist(responseJson))
    .catch(error => console.log(error.message))
}

function listItemListener(){
    $('.playlistItems').on('click', '.playlistItem', function(){
        let videoId = $(this).attr('data-key');
     displayVideo(videoId, 0);
    });
}

function timeStampLister(){
     $('.timeStampList').on('click', '.timeStampItem', function(event){
        event.stopPropagation();
        let videoId = $(this).closest('.playlistItem').attr('data-key');
        const min = Number($(this).find('.min').html());
        const sec = Number($(this).find('.sec').html());
        let totalSec = ( 60 * min) + sec;
        displayVideo(videoId, totalSec);
        });
    }

function displayPlaylist(responseJson){
    for(let i = 0 ; i < responseJson.items.length; i ++){
        let item = responseJson.items[i];
        let id = item.snippet.resourceId.videoId;
        $('.playlistItems').append(`<li class="playlistItem" data-key="${id}"><h4>${item.snippet.title}</h4>
        <img src='${item.snippet.thumbnails.default.url}' alt="img"><ul class="timeStampList"><li class="timeStampItem"><a href="#video" class="timeStamp"><span class="min">3</span>:<span class="sec">45</span></a></li><ul>
        <li>`);
    }
    listItemListener();
    timeStampLister();
}


function update(listItem, min, sec){
    let timeStampList = listItem.find('.timeStampList');
    timeStampList.append(`<li class="timeStampItem"><a href="#video" class="timeStamp"><span class="min">${min}</span>:<span class="sec">${sec}</span></a></li>
    `)
}

function watchForm(videoId){
    $('form').on('submit', function(event){
        event.preventDefault();
        let min = $('.minInput').val();
        let sec = $('.secInput').val();
        alert(min);
        alert(videoId);
        const listItem = $('.playlistItems').find(`#${videoId}`);
        console.log(listItem);
        update(listItem, min, sec);
    })

}

function displayVideo(videoId, seconds){
    console.log(seconds);
    //autofocus on video
    $('#video').html(`
    <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?start=${seconds}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <form>
    <legend>New Time Stamp</legend>
    <label for="minInput">Minute</label>
    <input type="number" class="minInput" placeholder="00"></input>
    <label for="secInput">Second</label>
    <input type="number" class="secInput" placeholder="00"></input>
    <button type="submit">Submit</button>
    </form>
    `)
    watchForm(videoId);
}


$(fetchUrl);

