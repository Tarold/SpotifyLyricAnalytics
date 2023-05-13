import { clientId, redirectUri } from './../configs'

export async function getMe () {
  let accessToken = await localStorage.getItem('access_token')

  try {
    let response
    if (accessToken !== 'null') {
      response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      })
    } else {
      throw new Error('Request accessToken')
    }

    if (!response.ok) {
      throw new Error('Request failed')
    }

    return response
  } catch (error) {
    await new Promise(resolve => setTimeout(resolve, 500))

    return getMe()
  }
}

export async function exchangeToken (code) {
  let codeVerifier = localStorage.getItem('codeVerifier')

  let body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
  })
  return await fetch('https://accounts.spotify.com/api/token', {
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
    .catch(error => error)
}
export async function getArtist (artistName) {
  const accessToken = localStorage.getItem('access_token')
  return fetch(
    `https://api.spotify.com/v1/search?q=${artistName}&type=artist`,
    {
      headers: {
        Authorization: 'Bearer ' + accessToken
      }
    }
  )
    .then(response => response.json())
    .then(data =>
      data.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url || '',
        albums: []
      }))
    )
    .catch(error => error)
}
export async function getAllAlbums (artist_id) {
  return await getAlbums(
    `https://api.spotify.com/v1/artists/${artist_id}/albums`,
    []
  )
}

async function getAlbums (uri, albums) {
  const accessToken = localStorage.getItem('access_token')

  return fetch(uri, {
    headers: {
      Authorization: 'Bearer ' + accessToken
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
      const merge_albums = [...albums, ...data.items]
      if (data.next) {
        return getAlbums(data.next, merge_albums)
      } else {
        console.log('merge_albums :>> ', merge_albums)
        return merge_albums
      }
    })
    .catch(error => error)
}

export async function getAlbumSongs (albumId) {
  return getSongs(`https://api.spotify.com/v1/albums/${albumId}/tracks`, [])
}
function getSongs (irl, songs) {
  const accessToken = localStorage.getItem('access_token')

  return fetch(irl, {
    headers: {
      Authorization: 'Bearer ' + accessToken
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
      const merge_songs = [...songs, ...data.items]

      if (data.next) {
        return getSongs(data.next, merge_songs)
      } else {
        return merge_songs
      }
    })
    .catch(error => error)
}

export async function getLyrics () {}

export async function getAlbum () {}
export async function getSong () {}
