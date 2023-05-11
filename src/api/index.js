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

export async function searchArtists (artistName) {
  const accessToken = localStorage.getItem('access_token')
  fetch(
    `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`,
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
