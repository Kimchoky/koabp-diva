import React from 'react'
import {useAuth} from "../contexts/AuthContext";
import VerifyingPage from "./verifying";
import LoginPage from "./login";

export default function HomePage() {

  const auth = useAuth();

  return (
    auth.user?.name ? (
      <VerifyingPage />
    ) : (
      <LoginPage />
    )
  )
}
