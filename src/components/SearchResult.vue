<template>
  <div class="results-container">
    <h2>Search Results</h2>
    <ul class="artist-list">
      <li v-for="(result, index) in results" :key="result.id">
        <div class="artist-element">
          <img class="artist-img" :src="result.image" alt="Artist Image" />
          <h3 class="artist-name">{{ result.name }}</h3>
          <button class="artist-button" :index="index" @click="start">
            START WITH
          </button>
        </div>

        <div v-if="index === 0" class="more-artists">More Artists:</div>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'SearchResult',
  props: ['results'],
  methods: {
    start (e) {
      const artistIndex = e.target.attributes.index.value
      this.$emit('artist-start', this.results[artistIndex])
    }
  }
}
</script>
<style scoped>
.artist-list {
  gap: 10px;
}
.artist-element {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: space-between;
}
.more-artists {
  margin-top: 25px;
}
.artist-img {
  width: 100px;
}
</style>
