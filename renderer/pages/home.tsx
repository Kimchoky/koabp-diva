import React from 'react'
import ThemeToggle from "../components/ThemeToggle";
import {useBLE} from "../contexts/BLEContext";
import Link from "next/link";
import ComponentDemo from "../components/ComponentDemo";

export default function HomePage() {

  return (

    <div>

      <ThemeToggle/>


      <Link href={"/verifying"}>Go to Verifying</Link>


      <ComponentDemo />

    </div>
  )
}
