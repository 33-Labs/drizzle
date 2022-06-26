import { useState } from 'react'

import Link from 'next/link'
import { Switch } from '@headlessui/react'

import TokenSelector from "./TokenSelector"

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function DropCreator(props) {
  const [timeLockEnabled, setTimeLockEnabled] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-y-10">
        {/** title */}
        <div>
          <h1 className="font-flow font-semibold text-4xl text-center">
            create drop
          </h1>
        </div>

        {/** name */}
        <div>
          <label className="block text-2xl font-bold font-flow">
            name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              placeholder="the name of this drop"
            />
          </div>
        </div>


        {/** description */}
        <div>
          <label className="block text-2xl font-bold font-flow">
            description
          </label>
          <div className="mt-1">
            <textarea
              rows={4}
              name="records"
              id="records"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              defaultValue={''}
              spellCheck={false}
              placeholder={
                "you can input 120 characters at most"
              }
              onChange={(event) => {
                // if event.vaule
              }}
            />
          </div>
        </div>


        {/** token selector */}
        <div>
          <TokenSelector 
            user={props.user}
            className="w-full" 
          />
        </div>


        {/** recipients & amounts */}
        <div>
          <label className="block text-2xl font-bold font-flow">
            recipients & amounts
          </label>
          <label className="block font-flow text-md leading-10">
            For each line, enter one address and the token amount, seperate with comma.
          </label>
          <div className="mt-1">
            <textarea
              rows={8}
              name="recipients"
              id="recipients"
              className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 resize-none block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
              defaultValue={''}
              spellCheck={false}
              placeholder={
                "0xf8d6e0586b0a20c7,1.6"
              }
              onChange={(event) => {}}
            />
          </div>
        </div>


        {/** time limit */}
        <div>
          <div className="flex justify-between">
            <label className="block text-2xl font-bold font-flow">
              time limit
            </label>
            <Switch
              checked={timeLockEnabled}
              onChange={setTimeLockEnabled}
              className={classNames(
                timeLockEnabled ? 'bg-drizzle-green' : 'bg-gray-200',
                'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle-green'
              )}
            >
              <span className="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                className={classNames(
                  timeLockEnabled ? 'translate-x-5' : 'translate-x-0',
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                )}
              />
            </Switch>
          </div>
          {timeLockEnabled ? <div>YES</div> : <div>NO</div>}

        </div>

        
        {/** create button */}
        <div>
          <Link href="/0x123/drop/123">
            <button
              type="button"
              className="h-12 w-40 px-6 text-base font-medium shadow-sm text-black bg-drizzle-green hover:bg-drizzle-green-dark"
              >
              create drop
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}