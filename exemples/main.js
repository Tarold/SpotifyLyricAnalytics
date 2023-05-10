;(function () {
  function generateRandomString (length) {
    let text = ''
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

  async function generateCodeChallenge (codeVerifier) {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(codeVerifier)
    )

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  }

  function generateUrlWithSearchParams (url, params) {
    const urlObject = new URL(url)
    urlObject.search = new URLSearchParams(params).toString()

    return urlObject.toString()
  }

  function redirectToSpotifyAuthorizeEndpoint () {
    const codeVerifier = generateRandomString(64)

    generateCodeChallenge(codeVerifier).then(code_challenge => {
      window.localStorage.setItem('code_verifier', codeVerifier)

      // Redirect to example:
      // GET https://accounts.spotify.com/authorize?response_type=code&client_id=77e602fc63fa4b96acff255ed33428d3&redirect_uri=http%3A%2F%2Flocalhost&scope=user-follow-modify&state=e21392da45dbf4&code_challenge=KADwyz1X~HIdcAG20lnXitK6k51xBP4pEMEZHmCneHD1JhrcHjE1P3yU_NjhBz4TdhV6acGo16PCd10xLwMJJ4uCutQZHw&code_challenge_method=S256

      window.location = generateUrlWithSearchParams(
        'https://accounts.spotify.com/authorize',
        {
          response_type: 'code',
          client_id,
          scope: 'user-read-private user-read-email',
          code_challenge_method: 'S256',
          code_challenge,
          redirect_uri
        }
      )

      // If the user accepts spotify will come back to your application with the code in the response query string
      // Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
    })
  }

  function exchangeToken (code) {
    const code_verifier = localStorage.getItem('code_verifier')

    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams({
        client_id,
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier
      })
    })
      .then(addThrowErrorToFetch)
      .then(data => {
        processTokenResponse(data)

        // clear search query params in the url
        window.history.replaceState({}, document.title, '/')
      })
      .catch(handleError)
  }

  function getArtist () {
    const artist_name = document.querySelector('#artist-name').value
    console.log('artist_name :>> ', artist_name)
    fetch(
      `https://api.spotify.com/v1/search?q=${artist_name}&type=artist&limit=1`,
      {
        headers: {
          Authorization: 'Bearer ' + access_token
        }
      }
    )
      .then(async response => {
        if (response.ok) {
          return response.json()
        } else {
          throw await response.json()
        }
      })
      .then(data => {
        localStorage.setItem('artist', JSON.stringify(data.artists.items[0]))
        console.log(data.artists.items[0])
      })
      .catch(error => {
        console.error(error)
        mainPlaceholder.innerHTML = errorTemplate(error.error)
      })
  }
  function getAllAlbums () {
    let artist_id = JSON.parse(localStorage.getItem('artist')).id
    localStorage.setItem('albums', JSON.stringify([]))
    fetchAlbums(`https://api.spotify.com/v1/artists/${artist_id}/albums`)
  }
  function fetchAlbums (irl) {
    fetch(irl, {
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    })
      .then(async response => {
        if (response.ok) {
          return response.json()
        } else {
          throw await response.json()
        }
      })
      .then(data => {
        let albums = JSON.parse(localStorage.getItem('albums'))
        albums = [...albums, ...data.items]
        localStorage.setItem('albums', JSON.stringify(albums))
        if (data.next) {
          fetchAlbums(data.next)
        } else {
          getAllSongs()
        }
      })
      .catch(error => {
        console.error(error)
        mainPlaceholder.innerHTML = errorTemplate(error.error)
      })
  }
  function getAllSongs () {
    const albums = JSON.parse(localStorage.getItem('albums'))
    localStorage.setItem('songs', '[]')
    albums.forEach(album => {
      fetchSongs(`https://api.spotify.com/v1/albums/${album.id}/tracks`)
    })
  }
  function fetchSongs (irl) {
    fetch(irl, {
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    })
      .then(async response => {
        if (response.ok) {
          return response.json()
        } else {
          throw await response.json()
        }
      })
      .then(data => {
        let songs = JSON.parse(localStorage.getItem('songs'))
        songs = [...songs, ...data.items]
        localStorage.setItem('songs', JSON.stringify(songs))
        if (data.next) {
          fetchSongs(data.next)
        } else {
          console.log('songs :>> ', songs)
        }
      })
      .catch(error => {
        console.error(error)
        mainPlaceholder.innerHTML = errorTemplate(error.error)
      })
  }
  function addLyrics () {
    try {
      const songs = JSON.parse(localStorage.getItem('songs'))
      songs.forEach(song => {
        fetch(
          `https://spotify-lyric-api.herokuapp.com/?url=https://open.spotify.com/track/${song.id}`
        )
          .then(async response => {
            if (response.ok) {
              return response.json()
            } else {
              throw await response.json()
            }
          })
          .then(data => {
            song.text = data.lines
            localStorage.setItem('songs', JSON.stringify(songs))
          })
          .catch(error => {
            song.text = undefined
            localStorage.setItem('songs', JSON.stringify(songs))
            console.log(error.message, song.name)
            // error.message == 'lyrics for this track is not available on spotify!'
            mainPlaceholder.innerHTML = errorTemplate(error.error)
          })
      })
    } catch (error) {
      console.error(error)
      mainPlaceholder.innerHTML = errorTemplate(error)
    }
  }
  function calculateSongs () {
    try {
      const songs = JSON.parse(localStorage.getItem('songs'))
      songs.forEach(song => {
        let counter = {}
        if (song.text) {
          song.text.forEach(line => {
            counter = countWords(line.words, counter)
          })
        }
        song.stats = counter
      })

      localStorage.setItem('songs', JSON.stringify(songs))
      console.log('songs :>> ', songs)

      if (songs) {
        let liba = {}
        songs.forEach(song => {
          liba = addWordCounts(liba, song.stats)
        })
        liba = sortWordCount(liba)
        TESTER = document.getElementById('tester')
        Plotly.newPlot(
          TESTER,
          [
            {
              x: Object.keys(liba),
              y: Object.values(liba)
            }
          ],
          {
            margin: { t: 0 }
          }
        )
      }
    } catch (error) {
      console.log(error)
      mainPlaceholder.innerHTML = errorTemplate(error)
    }
  }
  function countWords (str, wordCount) {
    const words = str
      .toLowerCase()
      .split(/[\s.,?!:;'"()\u2014\u2013♪]+|['’]/)
      .filter(word => word !== '')

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      if (!wordCount[word]) {
        wordCount[word] = 1
      } else {
        wordCount[word]++
      }
    }

    return wordCount
  }
  function sortWordCount (wordCount) {
    const entries = Object.entries(wordCount)
    entries.sort((a, b) => b[1] - a[1])
    const result = {}
    entries.forEach(([word, count]) => {
      result[word] = count
    })
    return result
  }
  function addWordCounts (wordCount1, wordCount2) {
    const result = { ...wordCount2 }

    for (const word in wordCount1) {
      if (wordCount1.hasOwnProperty(word)) {
        const count = wordCount1[word]
        result[word] = (result[word] || 0) + count
      }
    }

    return result
  }
  function refreshToken () {
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams({
        client_id,
        grant_type: 'refresh_token',
        refresh_token
      })
    })
      .then(addThrowErrorToFetch)
      .then(processTokenResponse)
      .catch(handleError)
  }

  function handleError (error) {
    console.error(error)
    mainPlaceholder.innerHTML = errorTemplate({
      status: error.response.status,
      message: error.error.error_description
    })
  }

  async function addThrowErrorToFetch (response) {
    if (response.ok) {
      return response.json()
    } else {
      throw { response, error: await response.json() }
    }
  }

  function logout () {
    localStorage.clear()
    window.location.reload()
  }

  function processTokenResponse (data) {
    console.log(data)

    access_token = data.access_token
    refresh_token = data.refresh_token

    const t = new Date()
    expires_at = t.setSeconds(t.getSeconds() + data.expires_in)

    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('expires_at', expires_at)

    oauthPlaceholder.innerHTML = oAuthTemplate({
      access_token,
      refresh_token,
      expires_at
    })

    // load data of logged in user
    getUserData()
  }

  function getUserData () {
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    })
      .then(async response => {
        if (response.ok) {
          return response.json()
        } else {
          throw await response.json()
        }
      })
      .then(data => {
        console.log(data)
        document.getElementById('login').style.display = 'none'
        document.getElementById('loggedin').style.display = 'unset'
        mainPlaceholder.innerHTML = userProfileTemplate(data)
      })
      .catch(error => {
        console.error(error)
        mainPlaceholder.innerHTML = errorTemplate(error.error)
      })
  }

  function userProfileTemplate (data) {
    return `<h1>Logged in as ${data.display_name}</h1>
      <table>
          <tr><td>Display name</td><td>${data.display_name}</td></tr>
          <tr><td>Id</td><td>${data.id}</td></tr>
          <tr><td>Email</td><td>${data.email}</td></tr>
          <tr><td>Spotify URI</td><td><a href="${data.external_urls.spotify}">${data.external_urls.spotify}</a></td></tr>
          <tr><td>Link</td><td><a href="{{href}">${data.href}</a></td></tr>
          <tr><td>Profile Image</td><td><a href="${data.images[0]?.url}">${data.images[0]?.url}</a></td></tr>
          <tr><td>Country</td><td>${data.country}</td></tr>
      </table>`
  }

  function oAuthTemplate (data) {
    return `<h2>oAuth info</h2>
      <table>
        <tr>
            <td>Access token</td>
            <td>${data.access_token}</td>
        </tr>
        <tr>
            <td>Refresh token</td>
            <td>${data.refresh_token}</td>
        </tr>
        <tr>
            <td>Expires at</td>
            <td>${new Date(parseInt(data.expires_at, 10)).toLocaleString()}</td>
        </tr>
      </table>`
  }

  function errorTemplate (data) {
    return `<h2>Error info</h2>
      <table>
        <tr>
            <td>Status</td>
            <td>${data.status}</td>
        </tr>
        <tr>
            <td>Message</td>
            <td>${data.message}</td>
        </tr>
      </table>`
  }

  // Your client id from your app in the spotify dashboard:
  // https://developer.spotify.com/dashboard/applications
  const client_id = 'd12d177d818048baa656df823fc9137d'
  const redirect_uri = 'http://127.0.0.1:8080/' // Your redirect uri

  // Restore tokens from localStorage
  let access_token = localStorage.getItem('access_token') || null
  let refresh_token = localStorage.getItem('refresh_token') || null
  let expires_at = localStorage.getItem('expires_at') || null

  // References for HTML rendering
  const mainPlaceholder = document.getElementById('main')
  const oauthPlaceholder = document.getElementById('oauth')

  // If the user has accepted the authorize request spotify will come back to your application with the code in the response query string
  // Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
  const args = new URLSearchParams(window.location.search)
  const code = args.get('code')

  if (code) {
    // we have received the code from spotify and will exchange it for a access_token
    exchangeToken(code)
  } else if (access_token && refresh_token && expires_at) {
    // we are already authorized and reload our tokens from localStorage
    document.getElementById('loggedin').style.display = 'unset'

    oauthPlaceholder.innerHTML = oAuthTemplate({
      access_token,
      refresh_token,
      expires_at
    })

    getUserData()
  } else {
    // we are not logged in so show the login button
    document.getElementById('login').style.display = 'unset'
  }

  document
    .getElementById('login-button')
    .addEventListener('click', redirectToSpotifyAuthorizeEndpoint, false)

  document
    .getElementById('refresh-button')
    .addEventListener('click', refreshToken, false)

  document
    .getElementById('logout-button')
    .addEventListener('click', logout, false)

  document
    .getElementById('artist-button')
    .addEventListener('click', getArtist, false)

  document
    .getElementById('songs-button')
    .addEventListener('click', getAllAlbums, false)
  document
    .getElementById('lyrics-button')
    .addEventListener('click', addLyrics, false)

  document
    .getElementById('calculate-button')
    .addEventListener('click', calculateSongs, false)
})()
