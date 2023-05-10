<template>
  <div class="results-container">
    <h2>Search Results</h2>
    <ul>
      <li v-for="result in results" :key="result.id">
        <h3>{{ result.name }}</h3>
        <img :src="result.image" alt="Artist Image" />
        <ul>
          <li v-for="song in result.songs" :key="song">{{ song }}</li>
        </ul>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'SearchResult',
  props: ['results']
}
</script>
