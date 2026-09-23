document.addEventListener('DOMContentLoaded', () => {
  const videoPlayer = document.getElementById('mainVideoPlayer');
  const videoTitle = document.getElementById('videoTitle');
  const videoList = document.getElementById('videoList');
  const videoAlbumsView = document.getElementById('videoAlbumsView');
  const videoInsideAlbumView = document.getElementById('videoInsideAlbumView');
  const currentVideoAlbumTitle = document.getElementById('currentVideoAlbumTitle');
  const backToVideoAlbumsBtn = document.getElementById('backToVideoAlbumsBtn');

  const audioPlayer = document.getElementById('mainAudioPlayer');
  const audioTitle = document.getElementById('audioTitle');
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

  const modalPreviewImg = document.getElementById('modalPreviewImg');
  const modalImageTitle = document.getElementById('modalImageTitle');
  const photoModal = new bootstrap.Modal(document.getElementById('photoModal'));

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
        visual = `<img src="/media/photos/${encodeURIComponent(album.name)}/${encodeURIComponent(album.cover)}" class="gallery-img card-img-top" alt="${album.name}" loading="lazy">`;
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

    album.items.forEach((filename) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'list-group-item list-group-item-action text-truncate';
      item.textContent = filename;

      item.addEventListener('click', () => {
        setActiveItem(videoList, item);
        videoTitle.textContent = filename;
        videoPlayer.src = `/stream/videos/${encodeURIComponent(album.name)}/${encodeURIComponent(filename)}`;
        videoPlayer.play();
      });

      videoList.appendChild(item);
    });
  };

  const openMusicAlbum = (album) => {
    musicAlbumsView.classList.add('d-none');
    musicInsideAlbumView.classList.remove('d-none');
    currentMusicAlbumTitle.textContent = album.name;
    musicList.innerHTML = '';
    audioPlayer.src = '';
    audioTitle.textContent = 'Wybierz utwór do odtworzenia';
    musicSearchInput.value = '';

    album.items.forEach((filename) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'list-group-item list-group-item-action text-truncate';
      item.textContent = filename;

      item.addEventListener('click', () => {
        setActiveItem(musicList, item);
        audioTitle.textContent = filename;
        audioPlayer.src = `/stream/music/${encodeURIComponent(album.name)}/${encodeURIComponent(filename)}`;
        audioPlayer.play();
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

      const photoUrl = `/media/photos/${encodeURIComponent(album.name)}/${encodeURIComponent(filename)}`;

      const img = document.createElement('img');
      img.className = 'gallery-img card-img-top';
      img.src = photoUrl;
      img.alt = filename;
      img.loading = 'lazy';

      const footer = document.createElement('div');
      footer.className = 'card-footer p-2 text-truncate small text-secondary border-0';
      footer.textContent = filename;

      card.appendChild(img);
      card.appendChild(footer);
      col.appendChild(card);

      card.addEventListener('click', () => {
        modalPreviewImg.src = photoUrl;
        modalImageTitle.textContent = `${album.name} / ${filename}`;
        photoModal.show();
      });

      photoGallery.appendChild(col);
    });
  };

  musicSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const items = musicList.getElementsByTagName('button');
    
    Array.from(items).forEach((item) => {
      if (item.textContent.toLowerCase().includes(query)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });

  audioPlayer.addEventListener('ended', () => {
    if (autoplaySwitch.checked) {
      const activeItem = musicList.querySelector('.active');
      if (activeItem) {
        let nextItem = activeItem.nextElementSibling;
        
        while (nextItem && nextItem.style.display === 'none') {
          nextItem = nextItem.nextElementSibling;
        }
        
        if (nextItem) {
          nextItem.click();
        }
      }
    }
  });

  backToVideoAlbumsBtn.addEventListener('click', () => {
    videoInsideAlbumView.classList.add('d-none');
    videoAlbumsView.classList.remove('d-none');
    videoPlayer.pause();
  });

  backToMusicAlbumsBtn.addEventListener('click', () => {
    musicInsideAlbumView.classList.add('d-none');
    musicAlbumsView.classList.remove('d-none');
    audioPlayer.pause();
  });

  backToPhotoAlbumsBtn.addEventListener('click', () => {
    photosInsideAlbumView.classList.add('d-none');
    photoAlbumsView.classList.remove('d-none');
  });

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

  loadMedia();
});