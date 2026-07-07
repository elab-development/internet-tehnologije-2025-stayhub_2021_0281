"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppButton from "@/components/AppButton";
import AppInput from "@/components/AppInput";
import AuthShowcase from "@/components/AuthShowcase";

export default function AuthPage() {
  const router = useRouter();

  const [activeForm, setActiveForm] = useState<"login" | "register">("login");

  const [loginEmail, setLoginEmail] = useState("marta@example.com");
  const [loginPassword, setLoginPassword] = useState("password123");

  const [registerName, setRegisterName] = useState("New Client");
  const [registerEmail, setRegisterEmail] = useState("client@example.com");
  const [registerPassword, setRegisterPassword] = useState("password123");

  const [message, setMessage] = useState("");

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message);
      return;
    }

    router.push("/home");
  }

  async function register(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      // Novi korisnik preko javne forme uvek dobija CLIENT rolu.
      body: JSON.stringify({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: "CLIENT",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message);
      return;
    }

    setMessage("Registration successful. You can now log in.");
    setActiveForm("login");
    setLoginEmail(registerEmail);
    setLoginPassword(registerPassword);
  }

  return (
    <main className="auth-page-modern">
      <AuthShowcase />

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-logo">
            <img src="/logoSizeL.png" alt="EazyProperties logo" />
          </div>

          <p className="eyebrow">Welcome back.</p>
          <h2>{activeForm === "login" ? "Sign in to your account." : "Create your account."}</h2>
          <p className="auth-description">
            Use the same page to log in or register as a client.
          </p>

          <div className="auth-switch">
            <button
              type="button"
              className={activeForm === "login" ? "active" : ""}
              onClick={() => {
                setMessage("");
                setActiveForm("login");
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={activeForm === "register" ? "active" : ""}
              onClick={() => {
                setMessage("");
                setActiveForm("register");
              }}
            >
              Register
            </button>
          </div>

          {activeForm === "login" && (
            <form className="modern-form" onSubmit={login}>
              <AppInput
                label="Email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder="Enter your email"
              />

              <AppInput
                label="Password"
                type="password"
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="Enter your password"
              />

              {message && <p className="form-message">{message}</p>}

              <AppButton text="Login" type="submit" fullWidth />
            </form>
          )}

          {activeForm === "register" && (
            <form className="modern-form" onSubmit={register}>
              <AppInput
                label="Full name"
                value={registerName}
                onChange={setRegisterName}
                placeholder="Enter your full name"
              />

              <AppInput
                label="Email"
                value={registerEmail}
                onChange={setRegisterEmail}
                placeholder="Enter your email"
              />

              <AppInput
                label="Password"
                type="password"
                value={registerPassword}
                onChange={setRegisterPassword}
                placeholder="Create password"
              />

              {message && <p className="form-message">{message}</p>}

              <AppButton text="Register" type="submit" fullWidth />
            </form>
          )}

        </div>
      </section>
    </main>
  );
}