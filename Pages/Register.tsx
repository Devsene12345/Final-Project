import React, { useState, ChangeEvent, FormEvent } from "react";
import API from "../services/api";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
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
      await API.post("/auth/register", form);
      alert("Registration successful");
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      alert("Registration failed");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
      />

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

      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
