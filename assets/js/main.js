'luse strict'
 

let playlistIdArr = ['PLWWwA08a1OR9570cEKm0dw-MG19E9ZCVA', 'PLWWwA08a1OR-Sruf_9UtGIVYdcTaIkmZz'];
const key = 'AIzaSyCK0Go8xquMoUGq1szMVeaHU5NcepoHwi4';
const baseUrl = 'https://www.googleapis.com/youtube/v3';
const playlistItemEndpoint = '/playlistItems';
const playlistEndpoint = '/playlists';
const timeStampListArr = [];

function queryString(playlistId, endpoint){
    let params = {
        key : key,
        part : 'snippet'
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
    console.log('fetch: ' + id);
    let url = baseUrl + endpoint + '?' + queryString(id, endpoint);
    console.log(url);
    fetch(url)
    .then(response => {
        if (response.ok){
        return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson, playlistsContainer))
    .catch(error => displayErrorMessage(error.message))
}

function watchOpenCollection(){
    $('.openCollection').on('click', function(){
        $('#headerLogo').addClass('nodisplay');
        $('.openCollection').addClass('nodisplay');
        $('main').removeClass('nodisplay');
        $('.header').html(`Playlist Collection`);
      })
    }

function displayErrorMessage(message){
    console.log(error);
    $('#header').html(`Error : ${message}`);
}

function camelize(str){
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return "";
      return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

function displayResults(responseJson, playlistsContainer){
    console.log(responseJson);
    if (responseJson.kind == 'youtube#playlistListResponse'){
        for (let i = 0; i < responseJson.items.length; i++){
            let item = responseJson.items[i];
            let id = item.id
            playlistsContainer.append(
            `<li class="playlist ${camelize(item.snippet.title)}" id="${id}">
            <h3 class="playlistCollectionItemTitle" id="${item.snippet.title}">${item.snippet.title}</h3>
            <img class="playlistThumbnail" src="${item.snippet.thumbnails.standard.url}" alt="img"/>
            </li>`
            );
        }    
    }
    if (responseJson.kind == 'youtube#playlistItemListResponse'){
        let videoId;
        for(let i = 0 ; i < responseJson.items.length; i ++){
            let item = responseJson.items[i];
            videoId = item.snippet.resourceId.videoId;
            $('.playlistItemsContainer').append(`
            <li class="playlistItem" data_key="${videoId}">
                <h4 class="itemTitle">${item.snippet.title}</h4>
                <div class='thumbnailAndTimestamps'>
                    <a href="#header"><img class="videoThumbnail" src="${item.snippet.thumbnails.standard.url}" alt="img"></a>
                    <ul class="timeStampList ${videoId}" data_key="${videoId}">
                    </ul>
                </div>
            </li>`);
             displayTimeStampList(videoId); 
        }    
    }
}

//Add a new playlist 
function watchFormOpener(playlistsContainer, playlistFormDiv, playlistForm){
    $('.playlistFormOpener').on('click', function(event){
        event.stopPropagation();
        playlistFormDiv.removeClass('nodisplay');
        $('.playlistFormOpener').addClass('nodisplay');
        $('#playlistIdInput').focus();
        watchPlaylistForm(playlistsContainer, playlistFormDiv, playlistForm);
    })
}

function watchPlaylistForm(playlistsContainer, playlistFormDiv, playlistForm){
    playlistForm.on('submit', function(event){
        event.preventDefault();
        const playlistIdInput = $('#playlistIdInput').val();
        playlistsContainer.empty();
        $('.playlistItemsContainer').empty();
        playlistIdArr.push(playlistIdInput);
        console.log(playlistIdArr);
        //  playlistForm.off('submit');
        $('#playlistIdInput').val("");
        playlistFormDiv.addClass('nodisplay');
        $('.playlistFormOpener').removeClass('nodisplay');
        fetchUrl(playlistIdArr, playlistEndpoint, playlistsContainer);
    })
    watchPlaylistFormCloser(playlistFormDiv);
}

function watchPlaylistFormCloser(playlistFormDiv){
    $('.playlistFormCloser').on('click', function(event){
        event.stopPropagation();
        playlistFormDiv.addClass('nodisplay');
        $('.playlistFormOpener').removeClass('nodisplay');
    })
}

//handle playlist clicks
function watchPlaylistClick(backToBtn, playlistsContainer, playlistCollectionSection){
    playlistsContainer.on('click', '.playlist', function(){
        event.stopPropagation();
        $('.playlistItemsContainer').html("");
        $('.thumbnailAndTimestamps .timeStampList').html("");
         let playlistTitle = $(this).find('.playlistCollectionItemTitle').attr('id');
         $('.header').attr({'id':`${playlistTitle}`});
        $('.header').html(`Playlist : ${playlistTitle}`);
        $('#logo').addClass('nodisplay');
        playlistCollectionSection.addClass('nodisplay');
         $('#playlistVideosSection').find('.playlistItemsContiner').attr('id', `${playlistTitle}`);
         $('#playlistVideosSection').removeClass('nodisplay');
         backToBtn.addClass('backToCollection');
         showBackToBtn();
        let playlistId = $(this).attr('id');
        fetchUrl(playlistId, playlistItemEndpoint, playlistsContainer);
    });
}

function watchItemClick(backToBtn){
    $('.playlistItemsContainer').on('click', '.videoThumbnail', function(){
        event.stopPropagation();
        let videoId = $(this).closest('.playlistItem').attr("data_key");
        backToBtn.removeClass('backToCollection');
        backToBtn.addClass('backToPlaylist');
        showBackToBtn();
        displayVideo(videoId, 0);
    });
}

function displayVideo(videoId, seconds){
    $('#playlistVideosSection').addClass('nodisplay');
    let playlistTitle = $('.header').attr('id');
    $('.header').html(`Video from "${playlistTitle}"`);
    $('#videoPlayerSection').removeClass('nodisplay'); 
    $('#videoContainer').html(`
    <iframe src="https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `);
     displayVideoTimeStampList(videoId);
}

//Backtracking functionality
function showBackToBtn(){
    const backToBtnDiv = $('#backToBtnDiv');
    const backToBtn = $('#backToBtn');
    if (backToBtn.hasClass('backToCollection')){
        backToBtn.html(`<img id="youtubeArrow" src="assets/Youtube-128.png">Back To Collection`);
        backToBtnDiv.removeClass('nodisplay');
    }
    if (backToBtn.hasClass('backToPlaylist')){
        backToBtn.html(`<img id="youtubeArrow" src="assets/Youtube-128.png">Back To Playlist`);
    }
}

function watchBackTo(playlistCollectionSection, backToBtn, playlistVideosSection){
    backToBtn.on('click', function(){
     if (backToBtn.hasClass('backToCollection')){
        playlistVideosSection.addClass('nodisplay');
        playlistCollectionSection.removeClass('nodisplay');
        $('#backToBtnDiv').addClass('nodisplay');
        backToBtn.removeClass('backToCollection');
        $('#logo').removeClass('nodisplay');
        $('.header').attr({'id':""});
        $('.header').html(`Playlist Collection`);
     }
  if (backToBtn.hasClass('backToPlaylist')){
    $('#videoContainer').html("");
    $('#videoPlayerSection').addClass('nodisplay'); 
    playlistVideosSection.removeClass('nodisplay');
    backToBtn.removeClass('backToPlaylist');
    backToBtn.html('<img id="youtubeArrow" src="assets/Youtube-128.png">Back To Collection');
    backToBtn.addClass('backToCollection');
    let playlistTitle = $('.header').attr('id');
     $('.header').html(`Playlist : "${playlistTitle}"`);
  }
})
}

//Timestamps
function displayVideoTimeStampList(videoId){
    let list = $(`.thumbnailAndTimestamps .timeStampList.${videoId}`).html();
    const videoTimeStampList = $('#videoTimeStampListDiv').find('.timeStampList');
    videoTimeStampList.attr({'class': `timeStampList ${videoId}`, 'data_key':`${videoId}`});
    videoTimeStampList.html(list)
}

function displayTimeStampList(videoId){
    let arrItem = timeStampListArr.filter(item => item.id == videoId);
    if ($('.thumbnailAndTimestamps .timeStampList').hasClass(videoId)){
        for (let i = 0; i < arrItem.length; i++){
            let li = `<li class="timeStampItem" data_key="${videoId}"> 
            <a href="#header"><p class="timeStamp"><span
            class="min">${arrItem[i].min}</span>:<span class="sec">${arrItem[i].sec}</span> - <span class="message">${arrItem[i].message}</span></p></a>
            </li>`;
            $(`.thumbnailAndTimestamps .timeStampList.${videoId}`).append(li);
        }
    }
}

function watchOpenTimeStampForm(timeStampFormDiv, openTimeStampForm){
    openTimeStampForm.on('click', function(){
        openTimeStampForm.addClass('nodisplay');
        timeStampFormDiv.removeClass('nodisplay');
        $('#minInput').focus();
    })
}
    
function formatNumerInput(num) {
    if (num.length < 1){
       "00";
    }  
    else if (num.length < 2){
        return '0' + num;
    } 
    else return num;
  }

function watchTimeStampForm(openTimeStampForm, timeStampFormDiv){
    $('#timeStampForm').on('submit', function(event){
        event.preventDefault();
        let videoId = $('#videoTimeStampListDiv').find('.timeStampList').attr('data_key');
        let min = $('.minInput').val();
        let sec = $('.secInput').val(); 
        min = formatNumerInput(min);
        sec = formatNumerInput(sec);
        const message = $('.timeStampMessageInput').val();
        alert(`Timestamp: "${min}:${sec} - ${message}" has been added to your list`);
        timeStampFormDiv.addClass('nodisplay');
        $('#timeStampForm input').val('');
        openTimeStampForm.removeClass('nodisplay');
        update(videoId, min, sec, message);
    })
}

function update(videoId, min, sec, message){
    $(`.thumbnailAndTimestamps .timeStampList.${videoId}`).html("");
    timeStampListArr.push({
        id : videoId,
        min : min,
        sec : sec,
        message : message
    });
    displayTimeStampList(videoId);
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
    const playlistCollectionSection = $('*#playlistCollectionSection');
    const backToBtn = $('#backToBtn');
    const playlistVideosSection = $('#playlistVideosSection');
    const playlistFormDiv =$('#playlistFormDiv');
    const playlistForm = $('#playlistForm');
    const timeStampFormDiv = $('#timeStampFormDiv');
    const openTimeStampForm = $('#openTimeStampForm');
     fetchUrl(playlistIdArr, playlistEndpoint, playlistsContainer);
     watchOpenCollection();
     watchPlaylistClick(backToBtn, playlistsContainer, playlistCollectionSection);
     watchItemClick(backToBtn);
     watchBackTo(playlistCollectionSection, backToBtn, playlistVideosSection);
     watchFormOpener(playlistsContainer, playlistFormDiv, playlistForm ); 
     watchOpenTimeStampForm(timeStampFormDiv, openTimeStampForm);
     watchTimeStampForm(openTimeStampForm, timeStampFormDiv);
    watchTimeStampClick();
});
