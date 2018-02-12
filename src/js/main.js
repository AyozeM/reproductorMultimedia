import $ from 'jquery';
$(document).ready(()=>{
    getMultimedia();
    $(".playList").on("click","div",e=>{
        alert($(e.currentTarget).find("p").data("url"));
    })
});

const createHTML = data => $("<div>").append(
    $(`<p data-url="${data.url}">${data.name}</p>`)
)
const getMultimedia = () =>{
    $.ajax({
        url:'../data/data.json',
        success:response=>{
            $(".playList").find(".preloader").remove();
            response.audio.map(e=>createHTML(e).append('<i class="fas fa-headphones"></i>').appendTo(".playList"));
            response.video.map(e=>createHTML(e).append('<i class="fas fa-video"></i>').appendTo(".playList"));
        },
        beforeSend:()=>{
            $(".playList").append(
                $(`<p class="preloader">Cargando contenido...</p>`)
            );
        },
        error:()=>{
            alert("hubo un error");
        }
    });
}