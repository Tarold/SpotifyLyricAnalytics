<template>
  <div class="auth-container">
    <h1>Spotify Artist Search</h1>
    <p>Please log in with Spotify to use the Spotify API.</p>
    <button @click="authorize">Log in with Spotify</button>
  </div>
</template>

<script>
export default {
  name: 'AuthComponent',
  props: ['client_id', 'redirect_uri'],
  methods: {
    authorize () {
      const codeVerifier = this.generateRandomString(64)
      this.generateCodeChallenge(codeVerifier).then(code_challenge => {
        window.localStorage.setItem('codeVerifier', codeVerifier)

        window.location = this.generateUrlWithSearchParams(
          'https://accounts.spotify.com/authorize',
          {
            response_type: 'code',
            client_id: this.client_id,
            scope: 'user-read-private user-read-email',
            code_challenge_method: 'S256',
            code_challenge,
            redirect_uri: this.redirect_uri
          }
        )
      })
    },
    generateUrlWithSearchParams (url, params) {
      const urlObject = new URL(url)
      urlObject.search = new URLSearchParams(params).toString()

      return urlObject.toString()
    },
    generateRandomString (length) {
      let text = ''
      let possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
      }
      return text
    },
    async generateCodeChallenge (codeVerifier) {
      async function sha256 (plain) {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)

        return window.crypto.subtle.digest('SHA-256', data)
      }

      function base64urlencode (array) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(array)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '')
      }

      const hashed = await sha256(codeVerifier)
      return base64urlencode(hashed)
    }
  }
}
</script>
