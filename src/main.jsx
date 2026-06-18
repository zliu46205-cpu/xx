import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { AppShell } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { MethodsPage } from "./pages/MethodsPage";
import { MethodDetailPage } from "./pages/MethodDetailPage";
import { ConsultPage } from "./pages/ConsultPage";
import { AboutPage } from "./pages/AboutPage";
import { AuthPage } from "./pages/AuthPage";

function App() {
  const [route, setRoute] = useState("home");
  const [selectedMethod, setSelectedMethod] = useState("integrated");

  function navigate(nextRoute) {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderRoute() {
    if (route === "methods") {
      return <MethodsPage setRoute={navigate} selectedMethod={selectedMethod} selectMethod={setSelectedMethod} />;
    }
    if (route === "detail") {
      return <MethodDetailPage setRoute={navigate} selectedMethod={selectedMethod} selectMethod={setSelectedMethod} />;
    }
    if (route === "consult") {
      return <ConsultPage selectedMethod={selectedMethod} selectMethod={setSelectedMethod} />;
    }
    if (route === "about") {
      return <AboutPage />;
    }
    if (route === "login" || route === "admin") {
      return <AuthPage type={route} setRoute={navigate} />;
    }
    return <HomePage setRoute={navigate} selectMethod={setSelectedMethod} />;
  }

  return <AppShell route={route} setRoute={navigate}>{renderRoute()}</AppShell>;
}

createRoot(document.getElementById("root")).render(<App />);
