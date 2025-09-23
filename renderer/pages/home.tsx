import React from 'react'
import ThemeToggle from "../components/ThemeToggle";
import UserList from "../components/UserList";

export default function HomePage() {

  return (

    <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center">

      <ThemeToggle/>

      <UserList />

    </div>
  )
}
