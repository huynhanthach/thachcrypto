import React, { Component } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MenuComponent from "./MenuComponent";
import HomeComponent from "./HomeComponent";
import MyCartComponent from "./MyCartComponent";
import LoginComponent from "./LoginComponent";
import SignupComponent from "./SignupComponent";
import ProductDetailComponent from "./ProductDetailComponent";
import FooterComponent from "./FooterComponent";
import CheckoutComponent from "./CheckoutComponent";
import ProfileComponent from "./ProfileComponent";
import ProductBrandComponent from "./ProductBrandComponent";
import MyOrdersComponent from "./MyOrdersComponent";
import MyContext from "../contexts/MyContext";
import { CONFIG } from '../config';
class MainComponent extends Component {
  static contextType = MyContext;

  componentDidMount() {
    const token = localStorage.getItem("token");
    const customer = localStorage.getItem("customer");

    if (!token || !customer) {
      localStorage.removeItem("token");
      localStorage.removeItem("customer");

      if (this.context) {
        this.context.setToken("");
        this.context.setUser(null);
      }
    }
  }

  render() {
    return (
      <div className="main-content">
        <MenuComponent />

        <Routes>
          <Route path="/" element={<Navigate replace to="/home" />} />
          <Route path="/home" element={<HomeComponent />} />
          <Route path="/mycart" element={<MyCartComponent />} />
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/signup" element={<SignupComponent />} />
          <Route path="/product/:id" element={<ProductDetailComponent />} />
          <Route path="/product/list" element={<ProductBrandComponent />} />
          <Route path="/checkout" element={<CheckoutComponent />} />
          <Route path="/myprofile" element={<ProfileComponent />} />
          <Route path="/myorders" element={<MyOrdersComponent />} />
        </Routes>

        <FooterComponent />
      </div>
    );
  }
}

export default MainComponent;
