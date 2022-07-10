import { RadioGroup } from '@headlessui/react'

const modes = [
  {
    key: "Random",
    name: 'Random Amount',
    intro: 'Distribute specific amount to specific one in whitelist',
  },
  {
    key: "Identical",
    name: 'Identical Amount',
    intro: 'Under construction'
  }
]

export default function AmountSelector(props) {
  const {mode, setMode} = props

  return (
      <div className="mx-auto w-full">
        <RadioGroup value={mode} onChange={setMode}>
          <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
          <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-4">
            {modes.map((mode) => (
              <RadioGroup.Option
                key={mode.key}
                value={mode}
                className={({ active, checked }) =>
                  `${
                    active
                      ? 'ring-2 ring-drizzle-green ring-offset-2'
                      : 'ring-1 ring-black ring-opacity-5'
                  }
                  ${
                    checked ? 'bg-drizzle-green/80 text-black' : 'bg-white'
                  }

                  relative flex cursor-pointer rounded-2xl px-5 py-4 shadow-md focus:outline-none`
                }
              >
                {({ active, checked }) => (
                  <>
                    <div className="flex w-full items-center justify-between">
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