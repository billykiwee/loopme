
export async function getUnsplashImage(subject) {
    const apiKey = 'kj408nn4kDTQyU-H3nyemQ3bPkqEJf7CS5wUvAHNy0I'
    const url = `https://api.unsplash.com/photos/random?query=${subject}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${apiKey}`
      }
    });
    const data = await response.json()

    return {
        url: data.urls.regular,
        author: data.user.name,
        profileUrl: data.user.links.html
    }
}