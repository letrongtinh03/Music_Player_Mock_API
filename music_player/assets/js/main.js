const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $(".player");
const cd = $(".cd");
const heading = $(".heading");
const thumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const inputProgress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const musicApi = "http://localhost:3000/songs";
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  songs: [],
  getSongs: () => {
    let option = {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Loại nội dung bạn gửi đi
      },
    };
    return fetch(musicApi, option)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        app.songs = data;
      })
      .catch((error) => {
        console.error("Error: " + error);
      });
  },
  defineProperties: (songs) => {
    Object.defineProperty(app, "currentSong", {
      get: () => {
        return songs[app.currentIndex];
      },
    });
  },
  render: (data) => {
    const playList = $(".playlist");
    let htmls = data
      .map((song, index) => {
        return `<div class="song ${
          index === app.currentIndex ? "active" : ""
        } " data-index="${index}">
                      <div class="thumb" style="background-image: url(${
                        song.image
                      })"></div>
                      <div class="body">
                          <h3 class="title">${song.name}</h3>
                          <p class="author">${song.singer}</p>
                      </div>
                      <div class="option">
                          <i class="fas fa-ellipsis-h"></i>
                      </div>
                  </div>`;
      })
      .join("");
    playList.innerHTML = htmls;
  },
  handleEvent: () => {
    // Handles CD enlargement and reduction
    const cdWidth = cd.offsetWidth;
    document.onscroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Handles when click play button
    playBtn.onclick = () => {
      if (app.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Handle cd spining
    const thumbAnimate = thumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    thumbAnimate.pause();

    // Handle when song play
    audio.onplay = () => {
      app.isPlaying = true;
      player.classList.add("playing");
      thumbAnimate.play();
    };

    // Handle when song pause
    audio.onpause = () => {
      app.isPlaying = false;
      player.classList.remove("playing");
      thumbAnimate.pause();
    };
    // when audio progress change
    audio.ontimeupdate = () => {
      if (audio.duration) {
        let progressPercent = (audio.currentTime / audio.duration) * 100;
        inputProgress.value = progressPercent;
      }
    };

    // handle when seek song
    inputProgress.onchange = (e) => {
      let seekTime = (audio.duration * e.target.value) / 100;
      audio.currentTime = seekTime;
    };

    // handle when click next
    nextBtn.onclick = () => {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.next();
      }
      audio.play();
    };

    // handle when click prev
    prevBtn.onclick = () => {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.prev();
      }
      audio.play();
    };

    // handle when click random
    randomBtn.onclick = () => {
      app.isRandom = !app.isRandom;
      randomBtn.classList.toggle("active", app.isRandom); // if is random = false -> add class, else remove
    };
    // handle repeat song when audio ended
    repeatBtn.onclick = () => {
      app.isRepeat = !app.isRepeat;
      repeatBtn.classList.toggle("active", app.isRepeat);
    };
    // hanle next song when audio ended
    audio.onended = () => {
      if (app.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // listen click playlist
    playlist.onclick = (e) => {
      let songNode = e.target.closest(".song:not(.active)");
      if (songNode || !e.target.closest(".option")) {
        if (songNode) {
          app.currentIndex = Number(songNode.dataset.index);
          app.render(app.songs);
          app.loadCurrentSong();

          audio.play();
        }
        if (!e.target.closest(".option")) {
        }
      }
    };
  },
  loadCurrentSong: () => {
    heading.textContent = app.songs[app.currentIndex].name;
    thumb.style.backgroundImage = `url(${app.songs[app.currentIndex].image})`;
    audio.src = app.songs[app.currentIndex].path;

    // let songCurrentClass = "song_current-" + app.currentIndex;
    // const songElements = $$(".song");
    // songElements.forEach((element) => {
    //   if (element.classList.contains(songCurrentClass)) {
    //     element.classList.add("active");
    //   } else {
    //     element.classList.remove("active");
    //   }
    // });
  },
  next: () => {
    app.currentIndex++;
    if (app.currentIndex > app.songs.length - 1) {
      app.currentIndex = 0;
    }
    app.loadCurrentSong();
    app.render(app.songs);
    app.scrollToActiveSong();
  },
  prev: () => {
    app.currentIndex--;
    if (app.currentIndex < 0) {
      app.currentIndex = app.songs.length - 1;
    }
    app.loadCurrentSong();
    app.render(app.songs);
    app.scrollToActiveSong();
  },
  playRandomSong: () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * app.songs.length);
    } while (newIndex === app.currentIndex);
    console.log(newIndex);
    app.currentIndex = newIndex;
    app.loadCurrentSong();
    app.render(app.songs);
    app.scrollToActiveSong();
  },
  scrollToActiveSong: () => {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  },

  start: () => {
    app.getSongs().then(() => {
      app.render(app.songs);
      app.handleEvent();

      app.loadCurrentSong();
    });
  },
};

app.start();
