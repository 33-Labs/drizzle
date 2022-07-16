import { useState, useEffect } from 'react'
import Decimal from 'decimal.js';

import PacketModeSelector from "./PacketModeSelector";

export default function PacketSelector(props) {
  const {
    mode, setMode,
    capacity, setCapacity,
    identicalAmount, setIdenticalAmount,
    totalAmount, setTotalAmount
  } = props
  console.log(props)
  const disabled = props.disabled || false

  useEffect(() => {
    setCapacity('')
    setTotalAmount('')
    setIdenticalAmount('')
  }, [mode])

  const showExtraInputs = (mode) => {
    if (!mode) { return null }
    if (mode.key === "Random") {
      return (
        <div className="w-full flex flex-col gap-y-2 mt-1">
          <div className="flex items-center gap-x-2 sm:justify-between sm:w-full">
            <label className="block w-[75px] shrink-0 font-flow font-bold">Capacity</label>
            <input
              type="number"
              disabled={disabled}
              id="capacity"
              min="1"
              value={capacity}
              className="grow rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              onChange={(event) => { setCapacity(event.target.value)}}
            />
          </div>
          <div className="flex items-center gap-x-2">
          <label className="block w-[75px] shrink-0 font-flow font-bold">Total Amount</label>
            <input
              type="number"
              disabled={disabled}
              id="total_amount"
              min="0"
              value={totalAmount}
              className="grow rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              onChange={(event) => { setTotalAmount(event.target.value)}}
            />
          </div>
        </div>
      )
    }
  
    if (mode.key === "Identical") {
      return (
        <div className="w-full flex flex-col gap-y-2 mt-1">
          <div className="flex items-center gap-x-2 sm:justify-between sm:w-full">
            <label className="block w-[75px] shrink-0 font-flow font-bold">Capacity</label>
            <input
              type="number"
              disabled={disabled}
              id="capacity"
              value={capacity}
              min="1"
              className="grow rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              onChange={(event) => { setCapacity(event.target.value)}}
            />
          </div>
          <div className="flex items-center gap-x-2">
          <label className="block w-[75px] shrink-0 font-flow font-bold">Amount Per Entry</label>
            <input
              type="number"
              disabled={disabled}
              id="per_amount"
              value={identicalAmount}
              min="0"
              className="grow rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              onChange={(event) => { setIdenticalAmount(event.target.value)}}
            />
          </div>
        </div>
      )
    }
  
    return null
  }

  return (
    <div className="flex flex-col gap-y-2">
      <label className="block text-2xl font-bold font-flow">
        Amount
      </label>
      <PacketModeSelector mode={mode} setMode={setMode} />
      {
        showExtraInputs(mode)
      }
    </div>
  )
}