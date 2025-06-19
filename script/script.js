console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let res = await fetch(`https://api.github.com/repos/Yash11071312/musicyash/contents/songs/${folder}`);
    let data = await res.json();
    songs = [];

    for (let file of data) {
        if (file.name.endsWith(".mp3")) {
            songs.push({
                name: file.name,
                url: file.download_url
            });
        }
    }

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.name.replaceAll("%20", " ")}</div>
                <div>Hitanshu</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    document.querySelectorAll(".songlist li").forEach(li => {
        li.addEventListener("click", () => {
            let track = li.querySelector(".info div").innerText.trim();
            playMusic(track);
        });
    });

    return songs;
}

function playMusic(track, pause = false) {
    let songObj = songs.find(s => s.name === track);
    if (songObj) {
        currentSong.src = songObj.url;
        if (!pause) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        document.querySelector(".songinformation").innerHTML = decodeURI(track);
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    }
}
async function displayAlbums() {
    let res = await fetch(`https://api.github.com/repos/Yash11071312/musicyash/contents/songs/`);
    let folders = await res.json();
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (let folder of folders) {
        if (folder.type === "dir") {
            try {
                let metaRes = await fetch(`https://raw.githubusercontent.com/Yash11071312/musicyash/main/songs/${folder.name}/info.json`);
                let meta = await metaRes.json();
                cardContainer.innerHTML += `
                <div class="card" data-folder="${folder.name}">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="https://raw.githubusercontent.com/Yash11071312/musicyash/main/songs/${folder.name}/cover.jpg" alt="">
                    <h2>${meta.title}</h2>
                    <p>${meta.description}</p>
                </div>`;
            } catch (err) {
                console.warn(`info.json not found for ${folder.name}`);
            }
        }
    }

    // Album card click to load songs
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            songs = await getSongs(folder);
            if (songs.length > 0) {
                playMusic(songs[0].name);
            }
        });
    });
}


    // Handle album card click
 // ✅ This one is correct — already in your code
document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", async () => {
        let folder = card.dataset.folder;
        songs = await getSongs(folder);
        if (songs.length > 0) {
            playMusic(songs[0].name);  // Make sure to use .name here
        }
    });
});



async function main() {
    await getSongs("fav");
    playMusic(songs[0].name, true);

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
currentSong.addEventListener("ended", () => {
    let current = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.findIndex(song => song.name === current);
    if (index !== -1 && index < songs.length - 1) {
        playMusic(songs[index + 1].name);
    }
});

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = (percent * 100) + "%";
        currentSong.currentTime = currentSong.duration * percent;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let current = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.findIndex(song => song.name === current);
        if (index > 0) playMusic(songs[index - 1].name);
    });

    next.addEventListener("click", () => {
        let current = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.findIndex(song => song.name === current);
        if (index !== -1 && index < songs.length - 1) {
            playMusic(songs[index + 1].name);
        }
    });

    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = "img/volume.svg";
        }
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
            e.preventDefault();
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/play.svg";
            }
        }
    });
}

window.onload = () => {
    main();
};
