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
        playPauseAnimation(e.currentTarget);
    });
    $(".progressBar").click(progressBarController);
    $(".progressBar").mousedown(e=>{
        progressBarController(e);
        $(e.currentTarget).on("mousemove",progressBarController);
    })
    
    $("#volumeUp").click(e=>{
        actualPlayed.volume+=.1;
        $("#volumeController").find("div").css("width",`${actualPlayed.volume*100}%`)
    });
    $("#volumeDown").click(e=>{
        actualPlayed.volume-=.1;
        $("#volumeController").find("div").css("width",`${actualPlayed.volume*100}%`)
    });

    $("#volumeController").click(volumeController);
    $("#volumeController").mousedown(e=>{
        $(e.currentTarget).on("mousemove",volumeController);
    });
    viewer.mouseup(e=>{
        $("#volumeController").off("mousemove",volumeController);
        $(".progressBar").off("mousemove",progressBarController);
    })
    viewer.on("click","img,video",()=>{
        playPauseAnimation($("#play-pause"));
    });
    loopController();
});
/**
 * modifica la barra de la linea del tiempo
 * @param {event} e
 */
const progressBarController = e=>{
    const target = $(e.currentTarget);
    let position = target.offset().left;
    let pointerPosition = e.pageX-position;
    let width = $(e.currentTarget).width();
    let newTime = (pointerPosition*100) / width;
    progressBar.css("width",`${newTime}%`);
    actualPlayed.currentTime = newTime*actualPlayed.duration/100;
}
/**
 * Modifica el volumen (arrastrando o clickando)
 * @param {event} e 
 */
const volumeController = e=>{
    const target = $(e.currentTarget);
    let position = target.offset().left;
    let pointerPosition = e.pageX-position;
    let width = $(e.currentTarget).width();
    let volumeDraw = (pointerPosition*100) / width;
    $("#volumeController").find("div").css("width",`${volumeDraw}%`)
    actualPlayed.volume = volumeDraw/100;
}
/**
 * Animacion que alterna los simoblos de play y pause
 * @param {event} e 
 */
const playPauseAnimation = e=>{
    let control = $(e);
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
}
/**
 * Se encarga de que se repita la playlist
 */
const loopController = () =>{
    if(index > playlist.length -1){
        index = 0;
    }
    playerManager(playlist[index]);
}
/**
 * se encarga de limpiar el audio/video anterior y poner el nuevo
 * @param {target} e 
 */
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
/**
 * Se encarga de crear el html en la barra de playlist
 * @param {object} data 
 * @param {string} type 
 */
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
/**
 * pone a funcionar el audio/video, tambien encapsula los eventos de actualizacion del tiempo y fin del archivo
 */
const player = () =>{
    actualPlayed.play();
    /**
     * cada vez que se modifica el tiempo se modifica la barra de progreso
     */
    actualPlayed.addEventListener("timeupdate",()=>{        
        updateProgressBar(actualPlayed.currentTime,actualPlayed.duration);
    });
    /**
     * llama al gestor del bucle al acabar el archivo
     */
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
/**
 * Se encarga de convertir cantidad de segundos en su equivalente en minutos y segundos
 * @param {*} time 
 */
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