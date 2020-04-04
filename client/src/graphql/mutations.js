export const CREATE_PIN_MUTATION = `
  mutation($title: String!, $content: String!, $image: String!, $longitude: Float!,
    $latitude: Float!) {
      createPin(input: {
        title: $title,
        content: $content,
        image: $image,
        longitude: $longitude,
        latitude: $latitude
      }) {
        _id
        createdAt
        title
        image
        content
        latitude
        longitude
        author {
          _id
          name
          email
          picture
        }
      }
    }
`