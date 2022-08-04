import { CalendarIcon } from "@heroicons/react/outline"

const TimeCard = ({ title, time, active }) => {
  return (
    <div className="w-full flex gap-x-2 items-center">
      <label className="block min-w-[80px] font-flow font-bold text-base">{title}</label>
      <div className={`grow flex gap-x-2 ring-2 ${active ? "ring-drizzle-green" : "ring-gray-300"} rounded-2xl p-3`}>
        <CalendarIcon className={`shrink-0 h-6 w-6 ${active ? "text-drizzle-green" : "text-gray-300"}`} aria-hidden="true" />
        <label className="font-flow font-bold text-base">
          {time}
        </label>
      </div>
    </div>
  )
}

export default function TimeLimitCard(props) {
  const {startAt, endAt, registrationEndAt} = props
  const current = new Date()

  let inRange = true
  if (startAt && (startAt.getTime() > current.getTime())) {
    inRange = false
  }

  if (endAt && (endAt.getTime() < current.getTime())) {
    inRange = false
  }

  if (registrationEndAt && (registrationEndAt.getTime() < current.getTime())) {
    inRange = false
  }

  return (
    <div className="w-full flex flex-col gap-y-2">
      {startAt && isFinite(startAt) ? <TimeCard title="START" time={startAt.toLocaleString()} active={inRange} /> : null}
      {registrationEndAt && isFinite(registrationEndAt) ? <TimeCard title="REG END" time={registrationEndAt.toLocaleString()} active={inRange} /> : null}
      {endAt && isFinite(endAt) ? <TimeCard title="END" time={endAt.toLocaleString()} active={inRange} /> : null}
    </div>
  )
}