import { useEffect } from "react";
import { navigate } from "@reach/router";

import { AmplifySignUp, AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";

const SignIn = ({ setUser, setAuthState }) => {
  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      // console.log(nextAuthState);
      setUser(authData);
      if (nextAuthState === AuthState.SignedIn) {
        navigate("/");
      }
    });
  }, [setUser, setAuthState]);

  return (
    <AmplifyAuthenticator>
      <AmplifySignUp
        slot="sign-up"
        headerText="Something here"
        formFields={[
          {
            type: "email",
            label: "Custom email Label",
            placeholder: "custom email placeholder",
            required: true,
          },
          {
            type: "username",
            label: "Custom username Label",
            placeholder: "custom username placeholder",
            required: true,
          },
          {
            type: "password",
            label: "Custom Password Label",
            placeholder: "custom password placeholder",
            required: true,
          },
          {
            type: "phone_number",
            label: "Custom Phone Label",
            placeholder: "custom Phone placeholder",
            required: true,
          },
          {
            type: "name",
            label: "Custom Name Label",
            placeholder: "custom Name placeholder",
            required: true,
          },
        ]}
      />
    </AmplifyAuthenticator>
  );
};

export default SignIn;
