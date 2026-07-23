import React, { Component } from "react";
import { BrowserRouter } from "react-router-dom";
import MainComponent from "./components/MainComponent";
import LoginComponent from "./components/LoginComponent";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: localStorage.getItem("token") || null,
    };
  }

  setToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    this.setState({ token: token });
  };

  render() {
    return (
      <BrowserRouter>
        {this.state.token ? (
          <MainComponent />
        ) : (
          <LoginComponent setToken={this.setToken} />
        )}
      </BrowserRouter>
    );
  }
}

export default App;
