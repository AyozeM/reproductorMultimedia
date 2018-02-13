import $ from 'jquery';
let data = require('../data/data.json');
let index = 0;
let actualPlayed, viewer, playlist, progressBar,totalDuration,actualProgress;

$(document).ready(()=>{
    viewer = $(".viewer");
    progressBar =  $(".progressedTimeBar");
    totalDuration = $(".totalTime");
    actualProgress = $(".actualProgress");
    getMultimedia();
    playlist = [].slice.call($(".playList").children());
    $(".playList").on("click","p",e=>{
        index = playlist.findIndex(y=>y==e.currentTarget);
        playerManager($(e.currentTarget));
    });
    $("#next").click(()=>{
        timeAdvance();
    })
    $("#prev").click(()=>{
        timeBack();
    })
    $("#play-pause").click(e=>{
        let control = $(e.currentTarget);
        let newIcon;
        let state;
        control.children().remove();
        state = control.data("state");
        if( state == "play"){
            newIcon = $(`<i class="fas fa-pause"></i>`);            
            state = "pause";            
        }else{
            newIcon = $(`<i class="fas fa-play"></i>`);
            state = "play";
        }
        control.data("state",state);
        playPause(state);
        newIcon.appendTo(control);
    });
    $(".progressBar").click(e=>{
        const barWidth = 75*innerWidth/100;
        let newTime = e.screenX/barWidth*100;
        actualPlayed.currentTime = newTime*actualPlayed.duration/100;
        progressBar.css("width",`${newTime}%`);
    });
    loopController();
});
const loopController = () =>{
    if(index > playlist.length -1){
        index = 0;
    }
    playerManager(playlist[index]);
}
const playerManager = e=>{
    if(actualPlayed != undefined){
        actualPlayed.pause();
        viewer.children()[0].remove();   
    }
    e = $(e);
    switch(e.attr("class")){
        case "audio":
            viewer.prepend($("<img>",{src:`media${e.data("poster")}`}));
            actualPlayed = new Audio(`media${e.data("url")}`);
            player();
            break;
        case "video":
            $("<video>").prependTo(viewer);
            actualPlayed = document.querySelector("video");
            actualPlayed.src = `media${e.data("url")}`;
            player();
            break;
    }
}
const createHTML = (data,type) =>$(`<p class="${type}" data-url="${data.url}" data-poster="${data.poster}">${data.name}</p>`).appendTo(".playList")

const getMultimedia = () =>{
    data.audio.map(e=>createHTML(e,"audio"));
    data.video.map(e=>createHTML(e,"video"));
    $(".audio").prepend($(`<i class="fas fa-headphones"></i>`))
    $(".video").prepend($(`<i class="fas fa-film"></i>`))
}
/**
 * Pausa o reanuda
 * @param {string} state --> stado actual.
 */
const playPause = state =>{
    if(state == "play"){
        actualPlayed.pause();
    }else{
        actualPlayed.play();
    }
}
const player = () =>{
    actualPlayed.play();
    actualPlayed.addEventListener("timeupdate",()=>{        
        updateProgressBar(actualPlayed.currentTime,actualPlayed.duration);
    });
    actualPlayed.addEventListener("ended",()=>{
        index++;
        loopController();
    });
}
/**
 * Actualiza la barra de progreso
 * @param {float} currentTime --> segundo actual
 * @param {float} duration --> duracion total
 */
const updateProgressBar = (currentTime,duration)=>{
    totalDuration.text(timeConverter(duration));
    actualProgress.text(timeConverter(currentTime));
    progressBar.css("width",`${(currentTime/duration)*100}%`);
    timeConverter(duration);
}
const timeConverter = time =>{
	let minutes = Math.trunc(time/60);
    let seconds = Math.trunc(((time/60 - minutes) * 30) / 0.5)
    if(seconds<10){
        seconds = '0'+seconds;
    }
    return `${minutes}:${seconds}`
}
/**
 * Avanza el tiempo 10 segundos
 */
const timeAdvance = () =>{
    actualPlayed.currentTime +=10;
}
/**
 * Retrocede el tiempo 10 segundos
 */
const timeBack = () =>{
    actualPlayed.currentTime -=10;
}