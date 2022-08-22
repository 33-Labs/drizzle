import { useRecoilState } from "recoil"
import { Switch } from '@headlessui/react'

import {
  transactionInProgressState
} from "../../lib/atoms"
import { classNames, getTimezone } from '../../lib/utils';
import { useEffect, useState } from "react";

const Timezone = getTimezone()

export default function TimeLimitPicker(props) {
  const [transactionInProgress,] = useRecoilState(transactionInProgressState)
  const [timezone, setTimezone] = useState(null)

  const {
    timeLockEnabled, setTimeLockEnabled,
    setStartAt, setEndAt
  } = props

  useEffect(() => {
    setTimezone(Timezone)
  }, [timezone])

  return (
    <div>
      <div className="flex justify-between items-center">
        <label className="block text-2xl font-bold font-flow">
          Time Limit{timezone ? ` (${timezone})` : ''}
        </label>
        <Switch
          disabled={transactionInProgress}
          checked={timeLockEnabled}
          onChange={() => {
            if (timeLockEnabled) {
              setStartAt(null)
              setEndAt(null)
            }
            setTimeLockEnabled(!timeLockEnabled)
          }}
          className={classNames(
            timeLockEnabled ? 'bg-drizzle-green' : 'bg-gray-200',
            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle-green'
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              timeLockEnabled ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
            )}
          />
        </Switch>
      </div>

      {timeLockEnabled ?
        <>
        <div className="mt-2 flex flex-col sm:flex-row justify-between gap-x-4 gap-y-2 flex-wrap">
          <div className="flex items-center gap-x-2">
            <label className="inline-block w-12 font-flow font-bold">Start</label>
            <input
              type="datetime-local"
              disabled={transactionInProgress}
              id="start_at"
              className="rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green-ultralight block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300 min-w-[220px]"
              onChange={(e) => { setStartAt(new Date(e.target.value)) }}
            />
          </div>

          <div className="flex items-center gap-x-2">
            <label className="inline-block w-12 font-flow font-bold">End</label>
            <input
              type="datetime-local"
              disabled={transactionInProgress}
              id="end_at"
              className="rounded-2xl focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green-ultralight block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300 min-w-[220px]"
              onChange={(e) => { setEndAt(new Date(e.target.value)) }}
            />
          </div>
        </div>
        </> : null}
    </div>
  )
}
