module.exports.getMe = async function getMe () {
  let accessToken = await localStorage.getItem('access_token')

  try {
    let response
    if (accessToken) {
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
