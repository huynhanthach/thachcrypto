import React, { Component } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainComponent from "./components/MainComponent";
import axios from "axios";

axios.defaults.baseURL = "/api";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <MainComponent />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    );
  }
}

export default App;
