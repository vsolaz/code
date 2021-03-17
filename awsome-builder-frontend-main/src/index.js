import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Home from "./Home";
import Video from "./Video";
import Upload from "./Upload";
import SignIn from "./SignIn";
import NotFound from "./NotFound";
import reportWebVitals from "./reportWebVitals";
import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";
import { Link, navigate, Router } from "@reach/router";

import { AmplifySignOut } from "@aws-amplify/ui-react";
import { Auth } from "aws-amplify";
import { useState, useEffect } from "react";
import styled from "styled-components";
import logoImg from "./octank.png";

const api_stuff = {
  API: {
    endpoints: [
      {
        name: "testApi",
        endpoint: "https://jw7qrbmrla.execute-api.eu-west-1.amazonaws.com",
      },
    ],
  },
  Storage: {
    AWSS3: {
      bucket: "vod-stack-ab3-source-12m8bpcozt64w",
      region: "eu-west-1",
    },
  },
};

const conf = Object.assign(api_stuff, awsconfig);

Amplify.configure(conf);

const Navbar = styled.header`
  width: 100wh;
  height: 75px;
  background: rgba(31, 41, 55, 1);
  display: flex;
  padding: 0 20px;

  & > div:first-child {
    width: 25%;
    display: flex;
    align-items: center;

    & > img {
      width: 75px;
      margin: 0 20px 0 0;
    }

    & > p {
      color: #fff;
      font-size: 2em;
      font-weight: bold;
    }

    &:hover {
      cursor: pointer;
    }
  }

  & > div:last-child {
    width: 75%;
    height: 100%;
    display: flex;
    flex-direction: row-reverse;
    justify-content: left;
    align-items: center;
    & > p {
      color: #fff;
      margin-right: 10px;
    }

    & > .signin {
      color: #fff;
      text-decoration: none;
      font-weight: bold;
    }
  }
`;

function App() {
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();

  useEffect(() => {
    const checkUser = async () => {
      try {
        let user = await Auth.currentAuthenticatedUser();
        setUser(user);
      } catch (error) {
        console.info("no user, going as guest");
      }
    };

    if (!user) {
      checkUser();
    }
  }, [user]);

  return (
    <>
      <Navbar>
        <div>
          <img
            src={logoImg}
            alt="Oktank Logo"
            onClick={() => {
              navigate("/upload");
            }}
          />
          <p
            onClick={() => {
              navigate("/");
            }}
          >
            OktankSports
          </p>
        </div>
        <div>
          {user ? <AmplifySignOut /> : null}
          {user && authState !== Auth.confirmSignUp ? (
            <p
              title={`Memberships: ${user.signInUserSession.accessToken.payload["cognito:groups"]}`}
            >
              Hello, {user?.attributes?.name}
            </p>
          ) : (
            <Link className="signin" to={`signin`}>
              Sign In
            </Link>
          )}
        </div>
      </Navbar>
      <Router>
        <Home path="/" user={user} />
        <Video path="/watch/:videoId" user={user} authState={authState} />
        <Upload path="/upload" user={user} />
        <SignIn path="/signin" setUser={setUser} setAuthState={setAuthState} />
        <NotFound default />
      </Router>
    </>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
