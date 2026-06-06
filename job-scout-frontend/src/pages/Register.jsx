import { useState } from "react";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data:", form);
    alert("Form submitted (backend not connected yet)");
  };

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h2>Register - Job Scout Pro</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10 }}
          />
        </div>

        <div>
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10 }}
          />
        </div>

        <div>
          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            style={{ width: "100%", marginBottom: 10 }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
            style={{ flex: 1 }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit" style={{ width: "100%" }}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
