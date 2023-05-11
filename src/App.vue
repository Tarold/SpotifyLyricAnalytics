<template>
  <head>
    <title>Spotify Artist Search</title>
  </head>
  <body>
    <div id="app">
      <auth-component
        v-if="!isAuthorized"
        :client_id="clientId"
      ></auth-component>
      <div v-if="isAuthorized">
        <user-component @logout="logOut"></user-component>

        <div v-if="status === 'search'">
          <search-bar @search="searchArtists"></search-bar>
          <search-result
            v-if="searchResults.length"
            :results="searchResults"
            @artist-start="selectArtist"
          ></search-result>
        </div>
        <div v-if="status === 'work'">
          <artist-viewer
            :artist="lastSearch"
            @getSong="getSong"
            @getAlbum="getAlbum"
            @getAll="getAll"
          ></artist-viewer>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import { getArtist, exchangeToken } from './api'

import UserComponent from './components/UserComponent.vue'
import AuthComponent from './components/AuthComponent.vue'
import SearchResult from './components/SearchResult.vue'
import SearchBar from './components/SearchBar.vue'
import ArtistViewer from './components/ArtistViewer.vue'

export default {
  name: 'App',
  components: {
    UserComponent,
    AuthComponent,
    SearchResult,
    SearchBar,
    ArtistViewer
  },
  data () {
    return {
      error: null,
      loading: null,
      isAuthorized: false,
      status: '',
      lastSearch: {},
      searchResults: [],
      accessToken: '',
      refreshToken: ''
    }
  },
  watch: {
    error: {
      handler (data) {
        localStorage.setItem('error', data)
      }
    },
    loading: {
      handler (data) {
        localStorage.setItem('loading', data)
      }
    },
    isAuthorized: {
      handler (data) {
        localStorage.setItem('is_authorized', data)
      }
    },
    status: {
      handler (data) {
        localStorage.setItem('status', data)
      }
    },
    lastSearch: {
      handler (data) {
        localStorage.setItem('last_searh', JSON.stringify(data))
      }
    },
    searchResults: {
      handler (data) {
        localStorage.setItem('search_result', JSON.stringify(data))
      }
    },
    accessToken: {
      handler (data) {
        localStorage.setItem('access_token', data)
      }
    },
    refreshToken: {
      handler (data) {
        localStorage.setItem('refresh_token', data)
      }
    }
  },
  mounted () {
    this.error =
      localStorage.getItem('error') === null
        ? null
        : localStorage.getItem('error')
    this.loading =
      localStorage.getItem('loading') === null
        ? null
        : localStorage.getItem('loading')
    this.isAuthorized =
      localStorage.getItem('is_authorized') === null
        ? false
        : localStorage.getItem('is_authorized')
    this.status =
      localStorage.getItem('status') === null
        ? false
        : localStorage.getItem('status')
    this.lastSearch =
      localStorage.getItem('last_searh') === null
        ? {}
        : JSON.parse(localStorage.getItem('last_searh'))
    this.searchResults =
      localStorage.getItem('search_result') === null
        ? []
        : JSON.parse(localStorage.getItem('search_result'))
    this.accessToken =
      localStorage.getItem('access_token') === null
        ? null
        : localStorage.getItem('access_token')
    this.refreshToken =
      localStorage.getItem('refresh_token') === null
        ? null
        : localStorage.getItem('refresh_token')

    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      this.getToken(code)
      window.history.replaceState({}, document.title, '/')
    }
  },
  methods: {
    logOut () {
      this.isAuthorized = false
      localStorage.clear()
    },
    async getToken (code) {
      exchangeToken(code)
        .then(data => {
          console.log('data :>> ', data)
          this.accessToken = data.access_token
          this.refreshToken = data.refresh_token
          this.isAuthorized = true
          this.status = 'search'
        })
        .catch(error => {
          console.error('Error exchangeToken:', error)
        })
    },
    async searchArtists (artistName) {
      this.error = null
      this.loading = true
      getArtist(artistName)
        .then(data => {
          console.log('data :>> ', data)
          this.searchResults = data
          this.loading = null
        })
        .catch(error => {
          this.error = true
          this.loading = null
          console.error('Error searching artists:', error)
        })
    },
    selectArtist (artist) {
      console.log('artist :>> ', artist)
      this.lastSearch = artist
      this.status = 'work'
    },
    getSong () {
      console.log('getSong :>> ')
    },
    getAlbum () {
      console.log('getAlbum :>> ')
    },
    getAll () {
      console.log('getAll :>> ')
    }
  }
}
</script>

<style>
@import 'reset.css';

#app {
  max-width: 860px;
  margin: 0 auto;
}

/* Body Styles */
body {
  font-family: 'Circular Spotify Text', Helvetica, Arial, sans-serif;
  background-color: #000;
  color: #fff;
  margin: 0;
  padding: 0;
}

/* Container Styles */
.search-container {
  text-align: center;
  padding: 30px;
}

.results-container {
  margin-top: 50px;
  padding: 30px;
}

/* Heading Styles */
h1,
h2,
h3 {
  font-weight: 400;
  margin: 0;
}

h1 {
  font-size: 32px;
  margin-bottom: 20px;
}

h2 {
  font-size: 24px;
  margin-bottom: 15px;
}

h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

/* Form Styles */
form {
  display: inline-block;
}

label {
  font-size: 20px;
  margin-right: 10px;
}

input[type='text'] {
  font-size: 16px;
  padding: 10px;
  border: none;
  border-radius: 20px;
}

button {
  background-color: #1db954;
  color: #fff;
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}
button[type='submit'] {
  background-color: #1db954;
  color: #fff;
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

/* List Styles */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 20px;
}

/* Image Styles */
imfghg {
  display: block;
  margin: 20px auto;
  max-width: 300px;
}
</style>
