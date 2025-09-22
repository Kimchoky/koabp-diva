import React from 'react'
import BleTest from "./ble-test";
import VerifyingPage from "./verifying";
import ThemeToggle from "../components/ThemeToggle";
import Button from "../components/ui/Button";
import {useBLE} from "../contexts/BLEContext";
import {Bluetooth, MessageSquareWarning} from "lucide-react";
import Link from "next/link";

const allButtonCombinations = () => {
  const combo = [];
  ['contained', 'outlined'].forEach(appearance => {
    ['primary', 'success', 'warning', 'error'].forEach(mode => {
      combo.push({ appearance, mode })
    })
  })
  return combo;
}

export default function HomePage() {

  const { bleState } = useBLE();

  return (

    <div>

      <ThemeToggle/>



      <Link href={"/verifying"}>Go to Verifying</Link>


      <div className="flex flex-wrap gap-10">
        { allButtonCombinations().map((combination, i) => (
          <Button key={i} mode={combination.mode} appearance={combination.appearance}>{combination.appearance} {combination.mode}</Button>
          ))
        }
      </div>




    </div>
  )
}
