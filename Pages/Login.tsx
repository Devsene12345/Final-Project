import React, { useState, ChangeEvent, FormEvent } from "react";
import API from "../services/api";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);

      // Save JWT token
      localStorage.setItem("token", res.data.token);

      alert("Login successful");
    } catch (error) {
      alert("Invalid email or password");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
