<template>
  <div class="search-container">
    <h1>Spotify Artist Search</h1>
    <form @submit.prevent="search">
      <label for="artist">Artist:</label>
      <input type="text" id="artist" v-model="artistName" />
      <button type="submit">Search</button>
    </form>
  </div>
</template>

<script>
export default {
  data () {
    return { artistName: '' }
  },
  name: 'SearchBar',
  props: ['results'],
  methods: {
    search () {
      this.$emit('search', this.artistName)
    }
  }
}
</script>
