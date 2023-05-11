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
  </div>
</template>

<script>
export default {
  data () {
    return { artistName: '' }
  },
  name: 'ArtistViewer',
  props: ['artist'],
  methods: {
    getAll () {
      this.$emit('getAll')
    },
    getAlbum () {
      this.$emit('getAlbum')
    },
    getSong () {
      this.$emit('getSong')
    }
  }
}
</script>
