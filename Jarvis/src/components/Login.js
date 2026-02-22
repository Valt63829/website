import React, { useState } from "react";
import { auth } from "../firebase/auth";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  return (
    <div>
      <h2>Jarvis Login</h2>
      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      <button onClick={register}>Register</button>
    </div>
  );
}

export default Login;