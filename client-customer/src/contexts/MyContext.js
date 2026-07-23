import React, { Component } from "react";

const MyContext = React.createContext();

class MyProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      user: null,
      mycart: [],
    };
  }

  componentDidMount() {
    const savedUser = localStorage.getItem("customer");
    const savedToken = localStorage.getItem("token");
    const savedCart = localStorage.getItem("mycart");

    if (savedUser && savedToken) {
      this.setState({
        user: JSON.parse(savedUser),
        token: savedToken,
        mycart: savedCart ? JSON.parse(savedCart) : [],
      });
    }
  }

  setToken = (value) => {
    this.setState({ token: value });
  };

  setUser = (value) => {
    this.setState({ user: value });
  };

  setMycart = (value) => {
    this.setState({ mycart: value });
    localStorage.setItem("mycart", JSON.stringify(value));
  };

  add2Cart = (product, quantity) => {
    let mycart = [...this.state.mycart];
    const index = mycart.findIndex((item) => item.product._id === product._id);

    if (index !== -1) {
      mycart[index].quantity += quantity;
    } else {
      mycart.push({ product: product, quantity: quantity });
    }

    this.setState({ mycart: mycart });
    localStorage.setItem("mycart", JSON.stringify(mycart));
  };

  render() {
    return (
      <MyContext.Provider
        value={{
          ...this.state,
          setToken: this.setToken,
          setUser: this.setUser,
          setMycart: this.setMycart,
          add2Cart: this.add2Cart,
        }}
      >
        {this.props.children}
      </MyContext.Provider>
    );
  }
}

export { MyProvider };
export default MyContext;
