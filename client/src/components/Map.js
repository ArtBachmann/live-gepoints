import React, { useState, useEffect, useContext } from "react";
import ReactMapGL, { NavigationControl, Marker } from 'react-map-gl'
import { withStyles } from "@material-ui/core/styles";
// import Button from "@material-ui/core/Button";
// import Typography from "@material-ui/core/Typography";
// import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

import { useClient } from '../client'
import { GET_PINS_QUERY } from '../graphql/queries'
import PinIcon from './PinIcon'
import Blog from './Blog'
import Context from '../context'

const INITIAL_VIEWPORT = {
  latitude: 60.249910,
  longitude: 24.808892,
  zoom: 13
}

const Map = ({ classes }) => {
  const client = useClient()
  const { state, dispatch } = useContext(Context)
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT)
  const [userPostition, setUserPosition] = useState(null)


  useEffect(() => {
    getUserPosition()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    getPins()
  }, [state.pins])


  const getUserPosition = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        setViewport({ ...viewport, latitude, longitude })
        setUserPosition({ latitude, longitude })
      })
    }
  }

  const getPins = async () => {
    const { getPins } = await client.request(GET_PINS_QUERY)
    // payload will be getPins array
    dispatch({ type: 'GET_PINS', payload: getPins })
  }

  const handleMapClick = ({ lngLat, leftButton }) => {
    if (!leftButton) return
    if (!state.draft) {
      dispatch({ type: 'CREATE_DRAFT' })
    }

    const [longitude, latitude] = lngLat

    dispatch({
      type: 'UPDATE_DRAFT_LOCATION',
      payload: { longitude, latitude }
    })
  }


  return (
    <div className={classes.root}>
      <ReactMapGL
        width='100vw'
        height='calc(100vh - 64px'
        mapStyle='mapbox://styles/mapbox/streets-v9'
        mapboxApiAccessToken='pk.eyJ1IjoiYXJ0YiIsImEiOiJjajlsMXVuNm00ZGx4Mndsc3VoNzhhajAzIn0.GWWQlCoRc7CWVuoU68-mJQ'
        onViewStateChange={newViewport => setViewport(newViewport)}
        onClick={handleMapClick}
        {...viewport}
      >
        {/* NavigationControl */}
        <div className={classes.navigationControl}>
          <NavigationControl
            onViewStateChange={newviewport => setViewport(newviewport)}
          />
        </div>
        {/* Pin for the user's current position */}
        {userPostition && (
          <Marker
            latitude={userPostition.latitude}
            longitude={userPostition.longitude}
            offsetLeft={-3}
            offsetTop={-13}
          >
            <PinIcon size={40} color='red' />
          </Marker>
        )}

        {/* Draft Pin */}
        {state.draft && (
          <Marker
            latitude={state.draft.latitude}
            longitude={state.draft.longitude}
            offsetLeft={-3}
            offsetTop={-13}
          >
            <PinIcon size={40} color='hotpink' />
          </Marker>
        )}
        {/* Created Pins */}
        {state.pins.map(pin => (
          <Marker
            key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
            offsetLeft={-3}
            offsetTop={-13}
          >
            <PinIcon size={40} color='darkblue' />
          </Marker>
        ))}
      </ReactMapGL>
      {/* Blog Area to add Pin Content */}
      <Blog />
    </div>
  )
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
