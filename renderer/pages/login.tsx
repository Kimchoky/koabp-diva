import React from 'react'
import ThemeToggle from "../components/ThemeToggle";
import UserList from "../components/UserList";
import Button from "../components/ui/Button";
import Link from "next/link";

export default function LoginPage() {

  return (

    <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center">

      <UserList />

      <Button>
        <Link href={"/examples/buttons"}>Buttons</Link>
      </Button>
      <Button>
        <Link href={"/examples/AuditUsageExamples"}>Audit</Link>
      </Button>

    </div>
  )
}
