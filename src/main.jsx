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
import { AccountPage } from "./pages/AccountPage";
import { BillingPage } from "./pages/BillingPage";
import { AdminPage } from "./pages/AdminPage";

const landingMap = {
  "/bazi": { route: "consult", method: "bazi" },
  "/ziwei": { route: "consult", method: "ziwei" },
  "/hehun": { route: "consult", method: "integrated" },
  "/qiming": { route: "consult", method: "naming" },
  "/liunian": { route: "consult", method: "bazi" },
};

function getInitialLanding() {
  return landingMap[window.location.pathname] || { route: "home", method: "integrated" };
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem("xuanxue-session") || "null");
  } catch {
    return null;
  }
}

function App() {
  const initialLanding = getInitialLanding();
  const [route, setRoute] = useState(initialLanding.route);
  const [selectedMethod, setSelectedMethod] = useState(initialLanding.method);
  const [session, setSession] = useState(loadSession);

  function navigate(nextRoute) {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAuth(nextSession) {
    const normalized = { token: nextSession.token, ...(nextSession.user || {}) };
    setSession(normalized);
    localStorage.setItem("xuanxue-session", JSON.stringify(normalized));
  }

  function logout() {
    setSession(null);
    localStorage.removeItem("xuanxue-session");
    navigate("home");
  }

  function renderRoute() {
    if (route === "methods") {
      return <MethodsPage setRoute={navigate} selectedMethod={selectedMethod} selectMethod={setSelectedMethod} />;
    }
    if (route === "detail") {
      return <MethodDetailPage setRoute={navigate} selectedMethod={selectedMethod} selectMethod={setSelectedMethod} />;
    }
    if (route === "consult") {
      return <ConsultPage selectedMethod={selectedMethod} selectMethod={setSelectedMethod} session={session} setRoute={navigate} />;
    }
    if (route === "billing") {
      return <BillingPage session={session} setRoute={navigate} />;
    }
    if (route === "account") {
      return <AccountPage session={session} setRoute={navigate} />;
    }
    if (route === "admin-dashboard") {
      return <AdminPage session={session} setRoute={navigate} />;
    }
    if (route === "about") {
      return <AboutPage />;
    }
    if (route === "login" || route === "admin") {
      return <AuthPage type={route} setRoute={navigate} onAuth={handleAuth} />;
    }
    return <HomePage setRoute={navigate} selectMethod={setSelectedMethod} />;
  }

  return <AppShell route={route} setRoute={navigate} session={session} logout={logout}>{renderRoute()}</AppShell>;
}

createRoot(document.getElementById("root")).render(<App />);


