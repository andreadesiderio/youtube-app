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
    console.log(responseJson);
    if (responseJson.kind == 'youtube#playlistListResponse'){
        for (let i = 0; i < responseJson.items.length; i++){
            let item = responseJson.items[i];
            let id = item.id
            playlistsContainer.append(
            `<li class="playlist" id="${id}">
            <h3 class="playlistCollectionItemTitle" id="${item.snippet.title}">${item.snippet.title}</h3>
            <img class="playlistThumbnail" src="${item.snippet.thumbnails.standard.url}" alt="img"/>
            </li>`
            );
        }    
    }
    if (responseJson.kind == 'youtube#playlistItemListResponse'){
        for(let i = 0 ; i < responseJson.items.length; i ++){
            let item = responseJson.items[i];
            let videoId = item.snippet.resourceId.videoId;
            $('.playlistItemsContainer').append(`
            <li class="playlistItem" data_key="${videoId}">
                <h4 class="itemTitle">${item.snippet.title}</h4>
                <div class='thumbnailAndTimestamps'>
                <a href="#header"><img class="videoThumbnail" src='${item.snippet.thumbnails.standard.url}' alt="img"></a>
                <ul class="timeStampList ${videoId}" data_key="${videoId}">
</ul>
                </div>
            </li>`);
        }      
    }
}

function watchOpenCollection(){
    $('.openCollection').on('click', function(){
        $('#logo').addClass('nodisplay');
        $('.openCollection').addClass('nodisplay');
        $('main').removeClass('nodisplay');
        $('.header').html(`Playlist Collection`);
      })
}
function watchPlaylistAddFormCloser(){
    $('.playlistFormCloser').on('click', function(event){
        event.stopPropagation();
        $('#playlistAdderContainer').addClass('nodisplay');
        $('.playlistFormOpener').removeClass('nodisplay');
    })
}

function watchFormOpener(playlistsContainer){
    $('.playlistFormOpener').on('click', function(event){
        event.stopPropagation();
        $('#playlistAdderContainer').removeClass('nodisplay');
        $('.playlistFormOpener').addClass('nodisplay');
        $('#playlistIdInput').focus();
        watchPlaylistAdder(playlistsContainer);
    })
}
function watchPlaylistAdder(playlistsContainer){
    $('#playlistAdder').on('submit', function(event){
        event.preventDefault();
        const playlistIdInput = $('#playlistIdInput').val();
        playlistsContainer.empty();
        $('.playlistItemsContainer').empty();
        playlistIdArr.push(playlistIdInput);
         $('#playlistAdder').off('submit');
        $('#playlistIdInput').val("");
        $('#playlistAdderContainer').addClass('nodisplay');
        $('.playlistFormOpener').removeClass('nodisplay');
        fetchUrl(playlistIdArr, playlistEndpoint, playlistsContainer);
    })
}

function watchPlaylistClick(playlistsContainer){
    playlistsContainer.on('click', '.playlist', function(){
        event.stopPropagation();
        $('.playlistItemsContainer').empty();
         let title = $(this).find('.playlistCollectionItemTitle').attr('id');
        $('.header').html(`Playlist : ${title}`);
        $('#logo').addClass('nodisplay');
         $('#playlistCollectionSection').addClass('nodisplay');
         $('#playlistVideosSection').find('.playlistItemsContainer').attr('id', `${title}`);
         $('#playlistVideosSection').removeClass('nodisplay');
         $('#playlistCollectionSectionOpener').addClass('backToCollection');
         $('#playlistCollectionSectionOpener').html(`<img id="youtubeArrow" src="assets/Youtube-128.png">Back To Collection`);
         $('#playlistCollectionSectionOpenerContainer').removeClass('nodisplay');
        let playlistId = $(this).attr('id');
        fetchUrl(playlistId, playlistItemEndpoint);
    });
}

function watchBackTo(){
 $('#playlistCollectionSectionOpener').on('click', function(){
     if ($('#playlistCollectionSectionOpener').hasClass('backToCollection')){
        $('#playlistVideosSection').addClass('nodisplay');
        $('#playlistCollectionSection').removeClass('nodisplay');
        $('#playlistCollectionSectionOpenerContainer').addClass('nodisplay');
        $('#playlistCollectionSectionOpener').removeClass('backToCollection');
        $('#logo').removeClass('nodisplay');
        $('.header').html(`Playlist Collection`);
     }
  if ($('#playlistCollectionSectionOpener').hasClass('backToPlaylist')){
    $('#videoPlayerSection').empty();
    $('#videoPlayerSection').addClass('nodisplay'); 
    $('#playlistVideosSection').removeClass('nodisplay');
    $('#playlistCollectionSectionOpener').removeClass('backToPlaylist');
    $('#playlistCollectionSectionOpener').html('<img id="youtubeArrow" src="assets/Youtube-128.png">Back To Collection');
    $('#playlistCollectionSectionOpener').addClass('backToCollection');
    let title = 
    $('#playlistVideosSection').find('.playlistItemsContainer').attr('id');
    $('.header').html(`Playlist : ${title}`);
  }
})
}

function watchItemClick(){
    $('.playlistItemsContainer').on('click', '.videoThumbnail', function(){
        event.stopPropagation();
        let videoId = $(this).closest('.playlistItem').attr("data_key");
        displayVideo(videoId, 0);
    });
}

function watchOpenCollection(){
    $('.openCollection').on('click', function(){
        $('#headerLogo').addClass('nodisplay');
        $('.openCollection').addClass('nodisplay');
        $('main').removeClass('nodisplay');
        $('.header').html(`Playlist Collection`);
      })
    }

function displayVideo(videoId, seconds){
    $('#playlistCollectionSectionOpener').removeClass('backToCollection');
    $('#playlistCollectionSectionOpener').addClass('backToPlaylist');
    $('#playlistCollectionSectionOpener').html('<img id="youtubeArrow" src="assets/Youtube-128.png">Back To Playlist');
    $('#playlistVideosSection').addClass('nodisplay');
    $('.header').html('YouTube Playlist App');
    $('#videoPlayerSection').removeClass('nodisplay'); 
    // width="560" height="315" 
    $('#videoContainer').html(`
    <iframe src="https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `);
    displayVideoTimeStampList(videoId);  
}

function displayVideoTimeStampList(videoId){
     let timeStampList = $('.playlistItemsContainer').find(`.playlistItem[data_key='${videoId}']`).find(`.timeStampList.${videoId}`).html();
     const videoTimeStampList = $('.videoTimeStampListContainer').find('.timeStampList');
     videoTimeStampList.attr({'class': `timeStampList ${videoId}`, data_key:`${videoId}`});
     videoTimeStampList.html(timeStampList);
    watchOpenTimeStampForm();
}

function watchOpenTimeStampForm(){
    $('.openTimeStampForm').on('click', function(){
        $('.openTimeStampForm').addClass('nodisplay');
        $('.timeStampFormContainer').removeClass('nodisplay');
        $('#minInput').focus();
    })
}
    
function watchTimeStampForm(){
    $('#timeStampForm').on('submit', function(event){
        event.preventDefault();
        let videoId = $('.videoTimeStampListContainer').find('.timeStampList').attr('data_key');
        const min = $('.minInput').val();
        const sec = $('.secInput').val();
        const message = $('.timeStampMessageInput').val();
        alert(`Timestamp: "${min}:${sec} - ${message}" has been added to your list`);
        $('.timeStampFormContainer').addClass('nodisplay');
        $('#timeStampForm input').val('');
        $('.openTimeStampForm').removeClass('nodisplay');
        update(videoId, min, sec, message);
    })
}

function update(videoId, min, sec, message){
    let timeStampList = $(`.timeStampList.${videoId}`);
    timeStampList.append(`<li class="timeStampItem" data_key="${videoId}">
    <a href="#header"><p class="timeStamp"><span
    class="min">${min}</span>:<span class="sec">${sec}</span> - <span class="message">${message}</span></p></a>
    </li>
    `);
    displayVideoTimeStampList(videoId);
}

function watchTimeStampClick(){
    $('body').on('click', '.timeStamp', function(event){
     event.stopPropagation();
    const videoId = $(this).closest('.timeStampItem').attr('data_key');
     const min = Number($(this).find('.min').html());
     const sec = Number($(this).find('.sec').html());
     let totalSec = ( 60 * min) + sec;
     displayVideo(videoId, totalSec);
    })
}

$(function onload(){
    const playlistsContainer = $('.playlistsContainer');
    fetchUrl(playlistIdArr, playlistEndpoint, playlistsContainer);
     watchOpenCollection();
     watchPlaylistAddFormCloser()
     watchBackTo();
     watchPlaylistClick(playlistsContainer);
     watchFormOpener(playlistsContainer);
     watchTimeStampForm();
     watchItemClick();
    watchTimeStampClick();
});
