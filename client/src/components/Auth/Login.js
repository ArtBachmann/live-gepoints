import React, { useContext } from "react";
import { GraphQLClient } from 'graphql-request'
import GoogleLogin from 'react-google-login'
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import Context from '../../context'
import { ME_QUERY } from '../../graphql/queries'
import { BASE_URL } from "../../client";


const Login = ({ classes }) => {
  // dispatch >>> message sent with speed
  const { dispatch } = useContext(Context)

  const onSuccess = async googleUser => {
    try {
      // After a user successfully signs in, get the user's ID token:
      const idToken = googleUser.getAuthResponse().id_token
      const client = new GraphQLClient(BASE_URL, {
        headers: { authorization: idToken }
      })
      const { me } = await client.request(ME_QUERY)
      console.log({ me })

      dispatch({ type: 'LOGIN_USER', payload: me })
      dispatch({ type: 'IS_LOGGED_IN', payload: googleUser.isSignedIn() })

    } catch (err) {
      onFailure(err)
    }
  }

  const onFailure = err => {
    console.error('Error logging in', err)
  }

  return (
    <div className={classes.root}>
      <Typography
        component='h3'
        variant='h4'
        gutterBottom
        noWrap
        style={{ color: 'rgb(66, 134, 344' }}
      >
        Tere tulemast, head sõbrad!!
      </Typography>
      <GoogleLogin
        // GeoPoints
        // clientId="859072023143-cj2cuoceka26uin9ruprkirub25qb4p6.apps.googleusercontent.com"
        // YoutubeProject
        clientId="526107329526-vv8k8i79inkvhtlp3ivun2nmi1j3s5hg.apps.googleusercontent.com"
        onSuccess={onSuccess}
        onFailure={onFailure}
        isSignedIn={true}
        theme='dark'
        buttonText='Google abil sisselogimine'
      />
    </div>

  )
}

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
