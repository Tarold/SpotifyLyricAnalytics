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
      <user-component v-if="isAuthorized" @logout="logOut"></user-component>
      <search-bar v-if="isAuthorized" @search="searchArtists"></search-bar>
      <search-result
        v-if="searchResults.length > 0"
        :results="searchResults"
      ></search-result>
    </div>
  </body>
</template>

<script>
import { searchArtists, exchangeToken } from './api'

import UserComponent from './components/UserComponent.vue'
import AuthComponent from './components/AuthComponent.vue'
import SearchResult from './components/SearchResult.vue'
import SearchBar from './components/SearchBar.vue'

export default {
  name: 'App',
  components: {
    UserComponent,
    AuthComponent,
    SearchResult,
    SearchBar
  },
  data () {
    return {
      error: null,
      loading: null,
      isAuthorized: false,
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
    lastSearch: {
      handler (data) {
        localStorage.setItem('last_searh', data)
      }
    },
    searchResults: {
      handler (data) {
        localStorage.setItem('search_result', data)
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
    this.lastSearch =
      localStorage.getItem('last_searh') === null
        ? {}
        : localStorage.getItem('last_searh')
    this.searchResults =
      localStorage.getItem('search_result') === null
        ? []
        : localStorage.getItem('search_result')
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
    async searchArtists (artistName) {
      this.error = null
      this.loading = true
      searchArtists(artistName)
        .then(data => {
          this.searchResults = data
          this.loading = null
        })
        .catch(error => {
          this.error = true
          this.loading = null
          console.error('Error searching artists:', error)
        })
    },
    async getToken (code) {
      exchangeToken(code)
        .then(data => {
          console.log('data :>> ', data)
          this.accessToken = data.access_token
          this.refreshToken = data.refresh_token
          this.isAuthorized = true
        })
        .catch(error => {
          console.error('Error exchangeToken:', error)
        })
    }
  }
}
</script>

<style>
@import 'reset.css';

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
