import $ from 'jquery';
let data = require('../data/data.json');
let index = 0;
let actualPlayed, viewer, playlist, progressBar,totalDuration,actualProgress;
let animationPlayinIcons = [
    `<i class="fas fa-volume-off"></i>`,
    `<i class="fas fa-volume-down"></i>`,
    `<i class="fas fa-volume-up"></i>`
];
let animationPlayingIndex = 0;
let animationPlayingInterval;
$(document).ready(()=>{
    viewer = $(".viewer");
    progressBar =  $(".progressedTimeBar");
    totalDuration = $(".totalTime");
    actualProgress = $(".actualProgress");
    getMultimedia();
    playlist = [].slice.call($(".playList").children());
    $(".playList").on("click","p",e=>{
        index = playlist.findIndex(y=>y==e.currentTarget);
        loopController();
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
    });
    
    $("#volumeUp").click(e=>{
        let actualVolume  = actualPlayed.volume + .1;
        actualPlayed.volume = actualVolume>1?1:actualVolume;
        $("#volumeController").find("div").css("width",`${actualPlayed.volume*100}%`)
    });
    $("#volumeDown").click(e=>{        
        let actualVolume = actualPlayed.volume-.1;
        actualPlayed.volume = actualVolume<0?0:actualVolume;
        $("#volumeController").find("div").css("width",`${actualPlayed.volume*100}%`)
    });

    $("#volumeController").click(volumeController);
    $("#volumeController").mousedown(e=>{
        $(e.currentTarget).on("mousemove",volumeController);
    });
    $("body").mouseup(e=>{
        $("#volumeController").off("mousemove",volumeController);
        $(".progressBar").off("mousemove",progressBarController);
    });
    $(".playList").on("click","#close",e=>{
        $(".playList").removeClass("showPlayList").find("#close").remove();
    });
    $(".togglePlayList").find("span").click(e=>{
        $(".playList").addClass("showPlayList").append(
            $(`<span id="close"><span><i class="fas fa-times"></i></span></span>`)
        );
    });
    $(".captions").on("click","#caption",e=>{
        let newIcon;
        if(actualPlayed.textTracks[0].mode == "hidden"){
            actualPlayed.textTracks[0].mode = "showing";
            newIcon = $(`<i class="fas fa-closed-captioning"></i>`);
        }else{
            actualPlayed.textTracks[0].mode = "hidden"
            newIcon = $(`<i class="far fa-closed-captioning"></i>`);
        }
        $(e.currentTarget).find("svg").remove();
        $(e.currentTarget).append(newIcon);
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
    $(".playing").removeClass("playing");
    if(animationPlayingInterval != undefined){
        clearInterval(animationPlayingInterval);
    }
    $(".animationPlaying").remove();
    animationPlayingIndex = 0;
    if(index > playlist.length -1){
        index = 0;
    }
    playerManager(playlist[index]);
    $(playlist[index]).addClass("playing").append($("<span>",{class:"animationPlaying"}));
    animationPlayingInterval = setInterval(animationPlayingMove,500);
}
/**
 * se encarga de limpiar el audio/video anterior y poner el nuevo
 * @param {target} e 
 */
const playerManager = e=>{
    if(actualPlayed != undefined){
        actualPlayed.pause();
        viewer.children()[0].remove();  
        viewer.find("img").remove();
        viewer.find(".captions").children().remove(); 
    }
    e = $(e);
    let formats = e.data("formats").split(",");
    switch(e.attr("class")){
        case "audio":        
            viewer.prepend($("<img>",{src:`media${e.data("poster")}`}));
            $("<audio>").append(
                formats.map(y=>$("<source>",{src:`media${e.data("url")}.${y}`}))     
            ).prependTo(viewer);
            actualPlayed = document.querySelector("audio");
            player();
            break;
        case "video":
            let responsiveVideo = e.data("medias").split(",");
            let captions = e.data("captions").split(",");      
            $(".captions").append(
                $(`<span id="caption"><i class="far fa-closed-captioning"></i></span>`)
            );
            $("<video>").append(
                formats.map(y=>{
                    let tag;
                    let mediaquery = responsiveVideo.find(z=>window.innerWidth<=z.split("x")[0]); 
                    mediaquery != undefined?tag = $("<source>",{src:`media${e.data("url")}.${mediaquery}.${y}`,type:`video/${y}`}):tag = $("<source>",{src:`media${e.data("url")}.${y}`,type:`video/${y}`});
                    return tag;
                })                
            ).append(
                captions.map(z=>$("<track>",{src:`media${z}`,kind:"subtitles",srclang:"es"}))
            ).prependTo(viewer);
            actualPlayed = document.querySelector("video");
            player();
            break;
    }
    actualPlayed.addEventListener("loadstart",e=>{
        viewer.append(
            $(`<i class="fas fa-spinner fa-pulse preloader"></i>`)
        )
    },false);
    actualPlayed.addEventListener("loadeddata",e=>{
        $(".preloader").remove();
    },false);
}
/**
 * Se encarga de crear el html en la barra de playlist
 * @param {object} data 
 * @param {string} type 
 */
const createHTML = (data,type) =>$(`<p class="${type}" data-medias="${data.media==null?"":data.media}" data-captions="${data.captions==null?"":data.captions}" data-formats="${data.formats}" data-url="${data.url}" data-poster="${data.poster}">${data.name}</p>`).appendTo(".playList")

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
/**
 * se encarga de la animacion en el archivo que se esta reproduciendo
 */
const animationPlayingMove = ()=>{
    animationPlayingIndex =  animationPlayingIndex < animationPlayinIcons.length?++animationPlayingIndex:0;
    $(".animationPlaying").children().remove();
    $(".animationPlaying").append(
        $(animationPlayinIcons[animationPlayingIndex])
    )
    
}