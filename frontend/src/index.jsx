import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarContextProvider } from "./helpers/toast";
import App from "./App";
import { SettingsProvider } from "./hooks/useSettings";

ReactDOM.render(
  //<React.StrictMode>
    <CssBaseline>
      <SettingsProvider>
        <SnackbarContextProvider>
          <App/>  
        </SnackbarContextProvider>
      </SettingsProvider>
    </CssBaseline>
  //</React.StrictMode>
, document.getElementById('root'));


//register();
