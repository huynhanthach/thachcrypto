import React, { Component } from "react";
import MyContext from "./MyContext";

class MyProvider extends Component {
  constructor(props) {
    super(props);

    const savedUser = localStorage.getItem("customer");
    const savedToken = localStorage.getItem("token");

    this.state = {
      user: savedUser ? JSON.parse(savedUser) : null,
      token: savedToken ? savedToken : "",
      mycart: [],
    };
  }

  setUser = (user) => {
    this.setState({ user: user });
  };

  setToken = (token) => {
    this.setState({ token: token });
  };

  setMycart = (mycart) => {
    this.setState({ mycart: mycart });
  };

  render() {
    return (
      <MyContext.Provider
        value={{
          user: this.state.user,
          token: this.state.token,
          mycart: this.state.mycart,
          setUser: this.setUser,
          setToken: this.setToken,
          setMycart: this.setMycart,
        }}
      >
        {this.props.children}
      </MyContext.Provider>
    );
  }
}

export default MyProvider;
