import { RadioGroup } from '@headlessui/react'
import Decimal from 'decimal.js'
import Hints from '../../lib/hints'

export const checkPacketMode = (packetMode, tokenBalance, capacity, amount = {}) => {
  try {
    const { identicalAmount, totalAmount } = amount
    if (!packetMode) throw Hints.InvalidPacket
    if (packetMode.key === PacketModeIdentical.key) {
      PacketModeIdentical.checkParams(capacity, identicalAmount, tokenBalance)
    } else if (packetMode.key === PacketModeRandom.key) {
      PacketModeRandom.checkParams(capacity, totalAmount, tokenBalance)
    }
    return [true, Hints.Valid]
  } catch (error) {
    return [false, error]
  }
}

const UINT32_MAX = 4294967295
export const PacketModeRandom = {
  key: "Random",
  name: 'Random Amount',
  intro: 'Distribute random amount of tokens to eligible account',
  checkParams: (capacity, totalAmount, tokenBalance) => {
    if (!capacity || isNaN(parseInt(capacity))) throw Hints.InvalidCapacity
    if (!totalAmount || isNaN(parseFloat(totalAmount))) throw Hints.InvalidTotalAmount
    if (!tokenBalance) throw Hints.InvalidTokenBalance

    const _capacity = new Decimal(capacity)
    if (!(_capacity.isInteger() && _capacity.isPositive() &&!_capacity.isZero() && _capacity.cmp(UINT32_MAX) == -1)) {
      throw Hints.InvalidCapacity
    }

    const _totalAmount = new Decimal(totalAmount)
    if (!(_totalAmount.isPositive() && !_totalAmount.isZero() && _totalAmount.decimalPlaces() <= 8)) {
      throw Hints.InvalidTotalAmount
    }

    if (_totalAmount.cmp(tokenBalance) != -1) {
      throw Hints.InsufficientBalance
    }
    return true
  }
}

export const PacketModeIdentical = {
  key: "Identical",
  name: 'Identical Amount',
  intro: 'Distribute identical amount of tokens to eligible account',
  checkParams: (capacity, identicalAmount, tokenBalance) => {
    if (!capacity || isNaN(parseInt(capacity))) throw Hints.InvalidCapacity
    if (!identicalAmount || isNaN(parseFloat(identicalAmount))) throw Hints.InvalidIdenticalAmount
    if (!tokenBalance) throw Hints.InvalidTokenBalance

    const _capacity = new Decimal(capacity)
    if (!(_capacity.isInteger() && _capacity.isPositive() &&!_capacity.isZero() && _capacity.cmp(UINT32_MAX) == -1)) {
      throw Hints.InvalidCapacity
    }

    const _identicalAmount = new Decimal(identicalAmount)
    if (!(_identicalAmount.isPositive() && !_identicalAmount.isZero() && _identicalAmount.decimalPlaces() <= 8)) {
      throw Hints.InvalidIdenticalAmount
    }

    if (_identicalAmount.mul(_capacity).cmp(tokenBalance) != -1) {
      throw Hints.InsufficientBalance
    }
    return true
  }
}

const modes = [PacketModeIdentical, PacketModeRandom]

export default function PacketModeSelector(props) {
  const { mode, setMode } = props

  return (
    <div className="mx-auto w-full">
      <RadioGroup value={mode} onChange={setMode}>
        <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-4 auto-rows-fr">
          {modes.map((mode) => (
            <RadioGroup.Option
              key={mode.key}
              value={mode}
              className={({ active, checked }) =>
                `${active
                  ? 'ring-2 ring-drizzle-green ring-offset-2'
                  : 'ring-1 ring-black ring-opacity-5'
                }
                  ${checked ? 'bg-drizzle-green text-black' : 'bg-white'
                }

                  relative flex cursor-pointer rounded-2xl px-5 py-4 shadow-md focus:outline-none`
              }
            >
              {({ active, checked }) => (
                <>
                  <div className="flex w-full items-start justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <RadioGroup.Label
                          as="p"
                          className={`font-semibold font-flow text-lg`}
                        >
                          {mode.name}
                        </RadioGroup.Label>
                        <RadioGroup.Description
                          as="span"
                          className={`inline text-gray-500`}
                        >
                          {mode.intro}
                        </RadioGroup.Description>
                      </div>
                    </div>
                    {checked && (
                      <div className="shrink-0 text-white">
                        <CheckIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
      <path
        d="M7 13l3 3 7-7"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}