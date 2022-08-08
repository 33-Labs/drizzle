import FloatPicker from '../float/FloatPicker'
import PacketSelector from './PacketSelector'
import TokenSelector from './TokenSelector'

export default function FloatReviewer(props) {
  const { user,
    token, setToken,
    tokenBalance, setTokenBalance,
    packetMode, setPacketMode,
    capacity, setCapacity,
    identicalAmount, setIdenticalAmount,
    threshold, setThreshold,
    totalAmount, setTotalAmount,
    floatMode, rawFloatInput,
    floatEvents, setFloatEvents,
    setFloatGroup, setFloatEventPairs,
    withTokenSelector,
    withDistributorSelector
  } = props

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-y-10 rounded-3xl
    border-4 border-drizzle-green-light border-dashed">
      {
      withTokenSelector ?
      <TokenSelector
        user={user}
        className="w-full"
        onTokenSelected={setToken}
        onBalanceFetched={setTokenBalance}
      />
      : null}
      {
        withDistributorSelector ?
      <PacketSelector
        mode={packetMode} setMode={setPacketMode}
        capacity={capacity} setCapacity={setCapacity}
        identicalAmount={identicalAmount} setIdenticalAmount={setIdenticalAmount}
        totalAmount={totalAmount} setTotalAmount={setTotalAmount}
      /> : null
      }
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