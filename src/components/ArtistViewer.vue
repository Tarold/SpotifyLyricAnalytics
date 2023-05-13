<template>
  <div class="artist-container">
    <div class="artist-element">
      <img class="artist-img" :src="artist.image" alt="Artist Image" />
      <h3 class="artist-name">{{ artist.name }}</h3>
      <span>Choose the scale of analytics:</span>
      <button class="artist-button" :index="index" @click="getSong">
        One Song</button
      ><button class="artist-button" :index="index" @click="getAlbum">
        One Album</button
      ><button class="artist-button" :index="index" @click="getAll">
        All compositions
      </button>
    </div>
    <div>
      <div>
        <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
        <label for="selectAll">Select All Albums</label>

        <ul v-if="albums">
          <li v-for="album in albums" :key="album.id" class="album">
            <div class="album-container">
              <input
                type="checkbox"
                v-model="album.selected"
                @change="updateAlbumSelection(album)"
                @click="toggleAlbumValue(album)"
              />
              <img
                :src="getAlbumImage(album)"
                alt="Album Image"
                class="album-img"
              />

              <label class="album-name">{{ album.name }}</label>

              <p class="album-date">Release Date: {{ album.release_date }}</p>
              <button @click="toggleSongsVisibility(album)">Open/Close</button>
            </div>

            <ul v-show="album.showSongs">
              <li
                v-for="song in album.songs"
                :key="song.id"
                class="song-container"
              >
                <input
                  type="checkbox"
                  v-model="song.selected"
                  @change="updateSongSelection(album)"
                />
                <label class="song-name">{{ song.name }}</label>
                <audio
                  v-if="song.preview_url"
                  :src="song.preview_url"
                  controls
                ></audio>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllAlbums, getAlbumSongs } from '@/api'

export default {
  data () {
    return {
      selectAll: false,
      albums: [
        {
          id: 'album1',
          name: 'Loading',
          selected: false,
          showSongs: false,
          songs: []
        }
      ]
    }
  },

  name: 'ArtistViewer',
  props: ['artist'],
  methods: {
    getAlbumImage (album) {
      if (album.images && album.images.length > 0) {
        return album.images[0].url
      }
      // Return a placeholder image URL or handle the case where no image is available
      return 'https://example.com/placeholder-image.jpg'
    },
    getAll () {
      getAllAlbums(this.artist.id)
        .then(data =>
          data.map(item => {
            item.selected = false
            item.showSongs = false
            item.songs = []
            return item
          })
        )
        .then(albums => (this.albums = albums))

      //this.$emit('getAll')
    },
    getAlbum () {
      this.$emit('getAlbum')
    },
    getSong () {
      this.$emit('getSong')
    },
    toggleSelectAll () {
      const selectValue = this.selectAll
      this.albums.forEach(album => {
        album.selected = selectValue
        album.songs.forEach(song => {
          song.selected = selectValue
        })
      })
    },
    updateAlbumSelection (album) {
      const selectedSongs = album.songs.filter(song => song.selected)
      album.selected = selectedSongs.length === album.songs.length
    },
    updateSongSelection (album) {
      const allSelected = album.songs.every(song => song.selected)
      album.selected = allSelected
    },
    toggleSongsVisibility (album) {
      album.showSongs = !album.showSongs
      if (album.songs.length === 0) {
        getAlbumSongs(album.id)
          .then(data => {
            album.songs = data
          })
          .then(() => {
            if (album.selected) {
              album.songs.forEach(song => {
                song.selected = album.selected
              })
            }
          })
      }
    },
    toggleAlbumValue (album) {
      album.selected = !album.selected
      album.songs.forEach(song => {
        song.selected = album.selected
      })
    }
  },
  mounted () {
    if (localStorage.getItem('albums')) {
      this.albums = JSON.parse(localStorage.getItem('albums'))
      this.selectAll = localStorage.getItem('select_all')
    } else {
      this.getAll()
    }
  },
  watch: {
    albums: {
      deep: true,
      handler (data) {
        const allSelected = data.every(album => album.selected)
        this.selectAll = allSelected
        localStorage.setItem('albums', JSON.stringify(data))
        localStorage.setItem('select_all', allSelected)
      }
    }
  }
}
</script>

<style scoped>
.artist-img {
  height: 300px;
}
.album-container,
.song-container {
  display: flex;
  align-items: center;
  border-top: 1px solid white;
  border-bottom: 1px solid white;
  padding: 5px;
  margin: 10px 0;
  justify-content: space-between;
}

.album-img,
.album-name,
.song-name {
  width: 100px;
  margin-left: 15px;
  margin-right: auto;
}
.album-img {
  margin-right: 0;
}
.song-name {
  white-space: nowrap;
}
.album-date {
  margin-right: 15px;
}
</style>
