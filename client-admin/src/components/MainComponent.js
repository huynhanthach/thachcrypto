import React, { Component } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MenuComponent from "./MenuComponent";
import HomeComponent from "./HomeComponent";
import CategoryComponent from "./CategoryComponent";
import ProductComponent from "./ProductComponent";
import OrderComponent from "./OrderComponent";
import CustomerComponent from "./CustomerComponent";
import { CONFIG } from '../config';
import AnalyticsComponent from "./AnalyticsComponent";
class MainComponent extends Component {
  componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState(null, null, window.location.pathname);
    }
  }

  render() {
    return (
      <div
        className="body-admin"
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: "#0f172a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* THANH MENU / NAVIGATION */}
        <MenuComponent />

        {/* NỘI DUNG CHÍNH CÁC ROUTE */}
        <main
          style={{
            flex: 1,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Routes>
            {/* DÒNG NÀY VÀO ĐỂ BẮT ĐƯỜNG DẪN GỐC */}
            <Route path="/" element={<Navigate replace to="/admin/home" />} />

            <Route
              path="/admin"
              element={<Navigate replace to="/admin/home" />}
            />
            <Route path="/admin/home" element={<HomeComponent />} />
            <Route path="/admin/category" element={<CategoryComponent />} />
            <Route path="/admin/product" element={<ProductComponent />} />
            <Route path="/admin/order" element={<OrderComponent />} />
            <Route path="/admin/customer" element={<CustomerComponent />} />
            <Route path="/admin/analytics" element={<AnalyticsComponent />} />
          </Routes>
        </main>
      </div>
    );
  }
}

export default MainComponent;