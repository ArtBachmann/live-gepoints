import React, { useState, useEffect, useContext } from "react";
import ReactMapGL, { NavigationControl, Marker, Popup } from 'react-map-gl'
import { withStyles } from "@material-ui/core/styles";
import differenceInMinutes from 'date-fns/differenceInMinutes'
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

import { useClient } from '../client'
import { GET_PINS_QUERY } from '../graphql/queries'
import { DELETE_PIN_MUTATION } from '../graphql/mutations'
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

  const [popup, setPopup] = useState(null)

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

  const highlightNewPin = pin => {
    const isNewPin = differenceInMinutes(Date.now(),
      Number(pin.createdAt)) <= 30
    return isNewPin ? 'limegreen' : 'darkblue'
  }

  const handleSelectPin = pin => {
    setPopup(pin)
    // Set up the pin data in the global state >>> with dispatch new action.
    //  As i understand at the moment the dispatch sets new global state 
    dispatch({ type: 'SET_PIN', payload: pin })
  }

  const isAuthUser = () => state.currentUser._id === popup.author._id

  const handleDeletePin = async pin => {
    const variables = { pinId: pin._id }
    const { deletePin } = await client.request(DELETE_PIN_MUTATION, variables)
    dispatch({ type: 'DELETE_PIN', payload: deletePin })
    setPopup(null)
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
            <PinIcon
              // function handled only when icon is clicked>>
              onClick={() => handleSelectPin(pin)}
              size={40}
              color={highlightNewPin(pin)} />
          </Marker>
        ))}

        {/* Popup Dialog for Created Pins */}
        {popup && (
          <Popup
            anchor='top'
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <img
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title}
            />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(6)},
                {popup.longitude.toFixed(6)}
              </Typography>
              {isAuthUser() && (
                <Button onClick={() => handleDeletePin(popup)}>
                  <DeleteIcon className={classes.deleteIcon} />
                </Button>
              )}
            </div>
          </Popup>
        )}

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
