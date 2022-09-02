import FloatPicker from '../float/FloatPicker'

export default function FloatReviewer(props) {
  const {
    threshold, setThreshold,
    floatMode, rawFloatInput,
    floatEvents, setFloatEvents,
    setFloatGroup, setFloatEventPairs,
  } = props

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-y-10 rounded-3xl
    border-4 border-drizzle-green-light border-dashed">
      <FloatPicker
        mode={floatMode}
        threshold={threshold} setThreshold={setThreshold}
        rawFloatInput={rawFloatInput}
        floatEvents={floatEvents} setFloatEvents={setFloatEvents}
        setFloatGroup={setFloatGroup} setFloatEventPairs={setFloatEventPairs}
      />
    </div>
  )
}