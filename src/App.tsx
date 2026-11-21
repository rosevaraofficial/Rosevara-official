import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

type Role = "buyer" | "seller" | "reseller";

type Profile = {
  full_name: string;
  phone: string;
  role: string;
};

export default function App() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [role, setRole] = useState<Role>("buyer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, phone, role")
      .eq("user_id", userId)
      .single();

    if (error) {
      setMessage("Profile load nahi hua: " + error.message);
      return;
    }

    setProfile(data);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session?.user) {
        loadProfile(data.session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setTimeout(() => loadProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone,
          role
        }
      }
    });

    setLoading(false);

    if (error) {
      setMessage("Registration error: " + error.message);
      return;
    }

    if (data.session) {
      setMessage("Account ban gaya hai!");
      await loadProfile(data.user!.id);
    } else {
      setMessage(
        "Registration successful! Apni email check karein aur verification link par click karein. Phir login karein."
      );
      setMode("login");
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      setMessage("Login error: " + error.message);
      return;
    }

    if (data.user) {
      await loadProfile(data.user.id);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfile(null);
    setMessage("Aap logout ho gaye hain.");
  }

  const roleName = (value: string) => {
    if (value === "buyer") return "Buyer Account";
    if (value === "seller") return "Seller Account";
    if (value === "reseller") return "Reseller Account";
    if (value === "admin") return "Administrator";
    return value;
  };

  return (
    <div className="rosevara">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, sans-serif; }
        .rosevara {
          min-height: 100vh;
          background: #fff8fa;
          color: #543344;
          padding: 20px;
        }
        .brand {
          text-align: center;
          padding: 25px 10px;
        }
        .brand h1 {
          color: #a34e70;
          font-family: Georgia, serif;
          letter-spacing: 5px;
          font-size: 36px;
          margin: 5px;
        }
        .brand p { color: #987887; font-size: 12px; letter-spacing: 2px; }
        .panel {
          max-width: 460px;
          margin: 20px auto;
          background: white;
          padding: 28px;
          border-radius: 16px;
          box-shadow: 0 8px 35px #67354b15;
          border: 1px solid #f0dfe6;
        }
        .panel h2 {
          font-family: Georgia, serif;
          text-align: center;
          color: #793e56;
          font-size: 27px;
        }
        .field { margin: 15px 0; }
        .field label {
          display: block;
          font-size: 13px;
          margin-bottom: 7px;
          font-weight: bold;
        }
        .field input, .field select {
          width: 100%;
          padding: 13px;
          border: 1px solid #e8cbd6;
          border-radius: 7px;
          background: white;
          font-size: 14px;
        }
        .roles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin: 15px 0;
        }
        .role {
          padding: 12px 4px;
          border: 1px solid #e5cbd5;
          background: white;
          color: #75445a;
          border-radius: 7px;
          font-size: 12px;
        }
        .role.selected {
          background: #9c526c;
          color: white;
          border-color: #9c526c;
        }
        .submit {
          width: 100%;
          padding: 14px;
          border: 0;
          border-radius: 7px;
          background: #9c526c;
          color: white;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 10px;
        }
        .submit:disabled { opacity: .6; }
        .switch {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
        }
        .switch button {
          border: 0;
          background: none;
          color: #a34e70;
          font-weight: bold;
          cursor: pointer;
        }
        .message {
          background: #f9edf2;
          padding: 12px;
          border-radius: 7px;
          font-size: 13px;
          line-height: 1.6;
          margin-top: 15px;
          overflow-wrap: anywhere;
        }
        .dashboard { text-align: center; }
        .dashboard h2 { color: #9c526c; }
        .account {
          background: #fff5f8;
          border-radius: 10px;
          padding: 18px;
          line-height: 2;
          text-align: left;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin: 40px 0 15px;
          color: #987887;
          font-size: 12px;
        }
        @media(max-width:400px) {
          .panel { padding: 19px; }
          .roles { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="brand">
        <h1>ROSEVARA</h1>
        <p>SHOP • SELL • EARN</p>
      </div>

      {profile ? (
        <div className="panel dashboard">
          <h2>Welcome to Rosevara!</h2>
          <p>Your account is active.</p>
          <div className="account">
            <b>Name:</b> {profile.full_name}<br />
            <b>Mobile:</b> {profile.phone || "Not added"}<br />
            <b>Account:</b> {roleName(profile.role)}
          </div>
          {profile.role === "admin" && (
            <p>Admin account: You have administrator access.</p>
          )}
          <button className="submit" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="panel">
          <h2>{mode === "signup" ? "Create Your Account" : "Welcome Back"}</h2>
          <p style={{ textAlign: "center", color: "#987887", fontSize: 13 }}>
            {mode === "signup"
              ? "Join the Rosevara marketplace"
              : "Login to your Rosevara account"}
          </p>

          {mode === "signup" && (
            <>
              <div className="field">
                <label>Choose Account Type</label>
                <div className="roles">
                  {(["buyer", "seller", "reseller"] as Role[]).map(item => (
                    <button
                      type="button"
                      key={item}
                      className={"role " + (role === item ? "selected" : "")}
                      onClick={() => setRole(item)}
                    >
                      {item === "buyer" ? "Buyer" :
                       item === "seller" ? "Seller" : "Reseller"}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignup}>
                <div className="field">
                  <label>Full Name</label>
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="field">
                  <label>Mobile Number</label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="03XXXXXXXXX"
                  />
                </div>
                <div className="field">
                  <label>Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>
                <button className="submit" disabled={loading}>
                  {loading ? "Please wait..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>
              <button className="submit" disabled={loading}>
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>
          )}

          {message && <div className="message">{message}</div>}

          <div className="switch">
            {mode === "signup" ? "Already have an account?" : "New to Rosevara?"}
            <button onClick={() => {
              setMessage("");
              setMode(mode === "signup" ? "login" : "signup");
            }}>
              {mode === "signup" ? " Login" : " Create Account"}
            </button>
          </div>
        </div>
      )}

      <div className="footer">
        © 2026 Rosevara. All rights reserved.
      </div>
    </div>
  );
         }
