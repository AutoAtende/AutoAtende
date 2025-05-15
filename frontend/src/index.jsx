import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import { SnackbarContextProvider } from "./helpers/toast";
import App from "./App";
import { SettingsProvider } from "./hooks/useSettings";

ReactDOM.render(
  //<React.StrictMode>
    <CssBaseline>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SettingsProvider>
          <SnackbarContextProvider>
            <App/>  
          </SnackbarContextProvider>
        </SettingsProvider>
      </LocalizationProvider>
    </CssBaseline>
  //</React.StrictMode>
, document.getElementById('root'));


//register();
