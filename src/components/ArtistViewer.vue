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

        <ul>
          <li v-for="album in albums" :key="album.id">
            <input
              type="checkbox"
              v-model="album.selected"
              @change="updateAlbumSelection(album)"
              @click="toggleAlbumValue(album)"
            />
            <label>{{ album.name }}</label>

            <button @click="toggleSongsVisibility(album)">Open/Close</button>

            <ul v-show="album.showSongs">
              <li v-for="song in album.songs" :key="song.id">
                <input
                  type="checkbox"
                  v-model="song.selected"
                  @change="updateSongSelection(album)"
                />
                <label>{{ song.name }}</label>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllAlbums } from '@/api'

export default {
  data () {
    return {
      selectAll: false,
      albums: [
        {
          id: 'album1',
          name: 'Album 1',
          selected: false,
          showSongs: false,
          songs: [
            { id: 'song1', name: 'Song 1', selected: false },
            { id: 'song2', name: 'Song 2', selected: false }
          ]
        },
        {
          id: 'album2',
          name: 'Album 2',
          selected: false,
          showSongs: false,
          songs: [
            { id: 'song3', name: 'Song 3', selected: false },
            { id: 'song4', name: 'Song 4', selected: false }
          ]
        }
      ]
    }
  },

  name: 'ArtistViewer',
  props: ['artist'],
  methods: {
    getAll () {
      console.log('object :>> ', this.artist.id)
      console.log('return :>> ', getAllAlbums(this.artist.id)) //this.$emit('getAll')
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
    },
    toggleAlbumValue (album) {
      album.selected = !album.selected
      album.songs.forEach(song => {
        song.selected = album.selected
      })
    }
  },
  watch: {
    albums: {
      deep: true,
      handler () {
        const allSelected = this.albums.every(album => album.selected)
        this.selectAll = allSelected
      }
    }
  }
}
</script>
