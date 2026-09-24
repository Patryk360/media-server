document.addEventListener('DOMContentLoaded', () => {
  const videoPlayer = document.getElementById('mainVideoPlayer');
  const videoTitle = document.getElementById('videoTitle');
  const videoList = document.getElementById('videoList');
  const videoAlbumsView = document.getElementById('videoAlbumsView');
  const videoInsideAlbumView = document.getElementById('videoInsideAlbumView');
  const currentVideoAlbumTitle = document.getElementById('currentVideoAlbumTitle');
  const backToVideoAlbumsBtn = document.getElementById('backToVideoAlbumsBtn');

  const stickyPlayerContainer = document.getElementById('stickyPlayerContainer');
  const closeStickyPlayerBtn = document.getElementById('closeStickyPlayerBtn');
  const audioPlayer = document.getElementById('mainAudioPlayer');
  const globalAudioTitle = document.getElementById('globalAudioTitle');
  const globalAudioArtist = document.getElementById('globalAudioArtist');
  const globalMusicCoverArt = document.getElementById('globalMusicCoverArt');
  const globalMusicDefaultIcon = document.getElementById('globalMusicDefaultIcon');
  const musicList = document.getElementById('musicList');
  const musicAlbumsView = document.getElementById('musicAlbumsView');
  const musicInsideAlbumView = document.getElementById('musicInsideAlbumView');
  const currentMusicAlbumTitle = document.getElementById('currentMusicAlbumTitle');
  const backToMusicAlbumsBtn = document.getElementById('backToMusicAlbumsBtn');
  const musicSearchInput = document.getElementById('musicSearchInput');
  const autoplaySwitch = document.getElementById('autoplaySwitch');

  const photoGallery = document.getElementById('photoGallery');
  const photoAlbumsView = document.getElementById('photoAlbumsView');
  const photosInsideAlbumView = document.getElementById('photosInsideAlbumView');
  const currentPhotoAlbumTitle = document.getElementById('currentPhotoAlbumTitle');
  const backToPhotoAlbumsBtn = document.getElementById('backToPhotoAlbumsBtn');

  const uploadForm = document.getElementById('uploadForm');
  const uploadStatus = document.getElementById('uploadStatus');

  const modalPreviewImg = document.getElementById('modalPreviewImg');
  const modalImageTitle = document.getElementById('modalImageTitle');
  const photoModalElement = document.getElementById('photoModal');
  
  let photoModal;
  if (photoModalElement) {
    photoModal = new bootstrap.Modal(photoModalElement);
  }

  let currentScale = 1;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;

  if (modalPreviewImg) {
    modalPreviewImg.style.transition = 'none';
    modalPreviewImg.style.cursor = 'grab';
    modalPreviewImg.style.maxHeight = '85vh';
    modalPreviewImg.style.objectFit = 'contain';

    const zoomContainer = modalPreviewImg.parentElement;
    zoomContainer.style.overflow = 'hidden';
    zoomContainer.style.display = 'flex';
    zoomContainer.style.alignItems = 'center';
    zoomContainer.style.justifyContent = 'center';

    const updateImageTransform = () => {
      modalPreviewImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    };

    zoomContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomStep = 0.15;
      
      if (e.deltaY < 0) {
        currentScale += zoomStep;
      } else {
        currentScale -= zoomStep;
      }
      
      currentScale = Math.min(Math.max(1, currentScale), 5);
      
      if (currentScale === 1) {
        translateX = 0;
        translateY = 0;
      }
      
      updateImageTransform();
    }, { passive: false });

    zoomContainer.addEventListener('mousedown', (e) => {
      if (currentScale > 1) {
        e.preventDefault();
        isPanning = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        modalPreviewImg.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateImageTransform();
    });

    window.addEventListener('mouseup', () => {
      isPanning = false;
      modalPreviewImg.style.cursor = 'grab';
    });

    zoomContainer.addEventListener('touchstart', (e) => {
      if (currentScale > 1 && e.touches.length === 1) {
        isPanning = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      }
    }, { passive: false });

    zoomContainer.addEventListener('touchmove', (e) => {
      if (!isPanning) return;
      e.preventDefault();
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      updateImageTransform();
    }, { passive: false });

    zoomContainer.addEventListener('touchend', () => {
      isPanning = false;
    });
  }

  if (photoModalElement) {
    photoModalElement.addEventListener('hidden.bs.modal', () => {
      currentScale = 1;
      translateX = 0;
      translateY = 0;
      if (modalPreviewImg) {
        modalPreviewImg.style.transform = 'translate(0px, 0px) scale(1)';
      }
    });
  }

  const setActiveItem = (listElement, activeBtn) => {
    Array.from(listElement.children).forEach((btn) => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  };

  const getIcon = (type) => {
    if (type === 'videos') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16"><path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm6.79-6.907A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/></svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16"><path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2z"/><path fill-rule="evenodd" d="M9 3v10H8V3h1z"/><path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5V2.82z"/></svg>`;
  };

  const getFileWord = (count) => {
    if (count === 1) return 'plik';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'pliki';
    return 'plików';
  };

  const renderAlbums = (albums, viewElement, type, onAlbumClick) => {
    viewElement.innerHTML = '';
    
    if (albums.length === 0) {
      viewElement.innerHTML = '<div class="col-12 text-secondary p-3">Brak folderów</div>';
      return;
    }

    albums.forEach((album) => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3';

      const card = document.createElement('div');
      card.className = 'card border-0 gallery-card media-card h-100 shadow-sm';

      let visual = '';
      if (type === 'photos') {
        visual = `<img src="/api/thumb/${encodeURIComponent(album.name)}/${encodeURIComponent(album.cover)}" class="gallery-img card-img-top" alt="${album.name}" loading="lazy">`;
      } else {
        visual = `<div class="album-icon-wrapper card-img-top">${getIcon(type)}</div>`;
      }

      card.innerHTML = `
        ${visual}
        <div class="card-body p-3">
          <h6 class="card-title text-truncate fw-bold mb-1 text-white">${album.name}</h6>
          <small class="text-secondary">${album.count} ${getFileWord(album.count)}</small>
        </div>
      `;

      card.addEventListener('click', () => onAlbumClick(album));
      col.appendChild(card);
      viewElement.appendChild(col);
    });
  };

  const openVideoAlbum = (album) => {
    videoAlbumsView.classList.add('d-none');
    videoInsideAlbumView.classList.remove('d-none');
    currentVideoAlbumTitle.textContent = album.name;
    videoList.innerHTML = '';
    videoPlayer.src = '';
    videoTitle.textContent = 'Wybierz film z listy';

    const oldTracks = videoPlayer.querySelectorAll('track');
    oldTracks.forEach(track => track.remove());

    album.items.forEach((filename) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'list-group-item list-group-item-action text-truncate';
      item.textContent = filename;

      item.addEventListener('click', () => {
        setActiveItem(videoList, item);
        videoTitle.textContent = filename;
        
        const existingTrack = videoPlayer.querySelector('track');
        if (existingTrack) {
          existingTrack.remove();
        }

        const baseNameMatch = filename.substring(0, filename.lastIndexOf('.'));
        const subFile = album.subs.find(s => s.startsWith(baseNameMatch) && s.endsWith('.vtt'));
        
        if (subFile) {
          const trackElem = document.createElement('track');
          trackElem.kind = 'subtitles';
          trackElem.label = 'Napisy';
          trackElem.srclang = 'pl';
          trackElem.src = `/media/videos/${encodeURIComponent(album.name)}/${encodeURIComponent(subFile)}`;
          trackElem.default = true;
          videoPlayer.appendChild(trackElem);
        }

        videoPlayer.src = `/stream/videos/${encodeURIComponent(album.name)}/${encodeURIComponent(filename)}`;
        
        const savedTime = localStorage.getItem(`vidTime_${filename}`);
        if (savedTime) {
          videoPlayer.currentTime = parseFloat(savedTime);
        }
        
        videoPlayer.play().catch(e => console.error(e));
      });

      videoList.appendChild(item);
    });
  };

  const openMusicAlbum = (album) => {
    musicAlbumsView.classList.add('d-none');
    musicInsideAlbumView.classList.remove('d-none');
    currentMusicAlbumTitle.textContent = album.name;
    musicList.innerHTML = '';
    
    if (musicSearchInput) {
      musicSearchInput.value = '';
    }

    album.items.forEach((filename) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'list-group-item list-group-item-action text-truncate';
      item.textContent = filename;
      
      item.dataset.filename = filename.toLowerCase();

      item.addEventListener('click', async () => {
        setActiveItem(musicList, item);
        
        stickyPlayerContainer.classList.remove('d-none');
        globalAudioTitle.textContent = 'Ładowanie...';
        if (globalAudioArtist) globalAudioArtist.textContent = '...';
        
        if (globalMusicCoverArt && globalMusicDefaultIcon) {
          globalMusicCoverArt.style.display = 'none';
          globalMusicDefaultIcon.style.display = 'block';
          globalMusicCoverArt.src = '';
        }

        audioPlayer.src = `/stream/music/${encodeURIComponent(album.name)}/${encodeURIComponent(filename)}`;
        
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => console.error(error));
        }

        try {
          const infoRes = await fetch(`/api/track-info/${encodeURIComponent(album.name)}/${encodeURIComponent(filename)}`);
          const info = await infoRes.json();
          globalAudioTitle.textContent = info.title;
          if (globalAudioArtist) globalAudioArtist.textContent = info.artist;

          const coverUrl = `/api/track-cover/${encodeURIComponent(album.name)}/${encodeURIComponent(filename)}`;
          const coverRes = await fetch(coverUrl, { method: 'HEAD' });
          if (coverRes.ok && globalMusicCoverArt && globalMusicDefaultIcon) {
            globalMusicCoverArt.src = coverUrl;
            globalMusicCoverArt.style.display = 'block';
            globalMusicDefaultIcon.style.display = 'none';
          }
        } catch (err) {
          globalAudioTitle.textContent = filename;
          if (globalAudioArtist) globalAudioArtist.textContent = 'Nieznany wykonawca';
        }
      });

      musicList.appendChild(item);
    });
  };

  const openPhotoAlbum = (album) => {
    photoAlbumsView.classList.add('d-none');
    photosInsideAlbumView.classList.remove('d-none');
    currentPhotoAlbumTitle.textContent = album.name;
    photoGallery.innerHTML = '';

    album.items.forEach((filename) => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3';

      const card = document.createElement('div');
      card.className = 'card bg-dark border-0 gallery-card media-card h-100 shadow-sm';

      const thumbUrl = `/api/thumb/${encodeURIComponent(album.name)}/${encodeURIComponent(filename)}`;
      const fullUrl = `/media/photos/${encodeURIComponent(album.name)}/${encodeURIComponent(filename)}`;

      const img = document.createElement('img');
      img.className = 'gallery-img card-img-top';
      img.src = thumbUrl;
      img.alt = filename;
      img.loading = 'lazy';

      const footer = document.createElement('div');
      footer.className = 'card-footer p-2 text-truncate small text-secondary border-0';
      footer.textContent = filename;

      card.appendChild(img);
      card.appendChild(footer);
      col.appendChild(card);

      card.addEventListener('click', () => {
        if (photoModal) {
          modalPreviewImg.src = fullUrl;
          modalImageTitle.textContent = `${album.name} / ${filename}`;
          photoModal.show();
        }
      });

      photoGallery.appendChild(col);
    });
  };

  if (musicSearchInput) {
    musicSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const items = musicList.querySelectorAll('button');
      
      items.forEach((item) => {
        const fileNameData = item.dataset.filename || '';
        if (fileNameData.includes(query)) {
          item.style.setProperty('display', 'block', 'important');
        } else {
          item.style.setProperty('display', 'none', 'important');
        }
      });
    });
  }

  if (audioPlayer) {
    audioPlayer.addEventListener('ended', () => {
      if (autoplaySwitch && autoplaySwitch.checked) {
        const activeItem = musicList.querySelector('.active');
        if (activeItem) {
          let nextItem = activeItem.nextElementSibling;
          
          while (nextItem) {
            const computedStyle = window.getComputedStyle(nextItem).display;
            const inlineStyle = nextItem.style.display;
            
            if (computedStyle !== 'none' && inlineStyle !== 'none') {
              break;
            }
            nextItem = nextItem.nextElementSibling;
          }
          
          if (nextItem) {
            nextItem.click();
          }
        }
      }
    });
  }

  if (closeStickyPlayerBtn) {
    closeStickyPlayerBtn.addEventListener('click', () => {
      audioPlayer.pause();
      stickyPlayerContainer.classList.add('d-none');
    });
  }

  if (videoPlayer) {
    let saveTimeTimeout;
    videoPlayer.addEventListener('timeupdate', () => {
      clearTimeout(saveTimeTimeout);
      saveTimeTimeout = setTimeout(() => {
        const currentSrcUrl = videoPlayer.currentSrc;
        if (currentSrcUrl && videoPlayer.currentTime > 0) {
          const decodedUrlString = decodeURIComponent(currentSrcUrl);
          const partsArray = decodedUrlString.split('/');
          const fName = partsArray[partsArray.length - 1];
          if (fName) {
            localStorage.setItem(`vidTime_${fName}`, videoPlayer.currentTime);
          }
        }
      }, 2000);
    });
  }

  if (backToVideoAlbumsBtn) {
    backToVideoAlbumsBtn.addEventListener('click', () => {
      videoInsideAlbumView.classList.add('d-none');
      videoAlbumsView.classList.remove('d-none');
      videoPlayer.pause();
    });
  }

  if (backToMusicAlbumsBtn) {
    backToMusicAlbumsBtn.addEventListener('click', () => {
      musicInsideAlbumView.classList.add('d-none');
      musicAlbumsView.classList.remove('d-none');
    });
  }

  if (backToPhotoAlbumsBtn) {
    backToPhotoAlbumsBtn.addEventListener('click', () => {
      photosInsideAlbumView.classList.add('d-none');
      photoAlbumsView.classList.remove('d-none');
    });
  }

  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      const typeVal = document.getElementById('uploadType').value;
      const albumVal = document.getElementById('uploadAlbum').value;
      const filesNode = document.getElementById('uploadFiles');
      
      formData.append('mediaType', typeVal);
      formData.append('albumName', albumVal);
      
      for (let i = 0; i < filesNode.files.length; i++) {
        formData.append('files', filesNode.files[i]);
      }
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (res.ok) {
          uploadStatus.classList.remove('d-none');
          uploadForm.reset();
          setTimeout(() => {
            uploadStatus.classList.add('d-none');
            loadMedia();
          }, 3000);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  const fetchSysInfo = async () => {
    try {
      const res = await fetch('/api/sysinfo');
      const data = await res.json();
      
      const tempElement = document.getElementById('sysCpuTemp');
      const ramElement = document.getElementById('sysRamUsage');
      const storageElement = document.getElementById('sysStorage');
      
      if (tempElement && data.cpu) {
        tempElement.textContent = `${data.cpu.main || 0} °C`;
      }
      
      if (ramElement && data.mem) {
        const usedRam = (data.mem.active / (1024 ** 3)).toFixed(2);
        const totalRam = (data.mem.total / (1024 ** 3)).toFixed(2);
        ramElement.textContent = `${usedRam} GB / ${totalRam} GB`;
      }
      
      if (storageElement && data.fsSize && data.fsSize.length > 0) {
        const mainDrive = data.fsSize[0];
        const usedStorage = (mainDrive.used / (1024 ** 3)).toFixed(2);
        const totalStorage = (mainDrive.size / (1024 ** 3)).toFixed(2);
        storageElement.textContent = `${usedStorage} GB / ${totalStorage} GB`;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMedia = async () => {
    try {
      const response = await fetch('/api/media');
      const data = await response.json();

      renderAlbums(data.videos || [], videoAlbumsView, 'videos', openVideoAlbum);
      renderAlbums(data.music || [], musicAlbumsView, 'music', openMusicAlbum);
      renderAlbums(data.photos || [], photoAlbumsView, 'photos', openPhotoAlbum);
    } catch (err) {
      console.error(err);
    }
  };

  fetchSysInfo();
  setInterval(fetchSysInfo, 10000);
  loadMedia();
});