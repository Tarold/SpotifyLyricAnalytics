<template>
  <head>
    <title>Spotify Artist Search</title>
    <link rel="stylesheet" type="text/css" href="reset.css" />
    <link rel="stylesheet" type="text/css" href="spotify.css" />
  </head>
  <body>
    <div id="app">
      <auth-component
        v-if="!isAuthorized"
        :client_id="clientId"
        :redirect_uri="redirectUri"
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
      clientId: 'd12d177d818048baa656df823fc9137d',
      redirectUri: 'http://127.0.0.1:8080/',
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
      this.exchangeToken(code)
      window.history.replaceState({}, document.title, '/')
    }
  },
  methods: {
    logOut () {
      this.isAuthorized = false
      localStorage.clear()
    },
    authorizeUser () {
      //this.isAuthorized = true
    },
    async searchArtists (artistName) {
      try {
        this.error = this.post = null
        this.loading = true
        const accessToken = localStorage.getItem('access_token')
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`,
          {
            headers: {
              Authorization: 'Bearer ' + accessToken
            }
          }
        )
        const data = await response.json()

        // Extract relevant information from the API response
        const artists = data.artists.items.map(artist => ({
          id: artist.id,
          name: artist.name,
          image: artist.images[0]?.url || '',
          albums: []
        }))

        this.searchResults = artists
      } catch (error) {
        this.error = true
        this.loading = this.post = null
        console.error(error)
      }
    },
    async exchangeToken (code) {
      let codeVerifier = localStorage.getItem('codeVerifier')

      let body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: codeVerifier
      })
      await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('HTTP status ' + response.status)
          }
          return response.json()
        })
        .then(data => {
          this.accessToken = data.access_token
          this.refreshToken = data.refresh_token
          this.isAuthorized = true
        })
        .catch(error => {
          console.error('Error:', error)
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
