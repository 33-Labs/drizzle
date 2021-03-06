import WhitelistInput from './WhitelistInput'
import TokenSelector from './TokenSelector'
import PacketSelector from './PacketSelector'

export default function WhitelistReviewer(props) {
  const {
    user, setToken, setTokenBalance, callback,
    packetMode, setPacketMode,
    capacity, setCapacity,
    identicalAmount, setIdenticalAmount,
    totalAmount, setTotalAmount,
  } = props

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-y-10 rounded-3xl
    border-4 border-drizzle-green/30 border-dashed">
      <TokenSelector
        user={user}
        className="w-full"
        onTokenSelected={setToken}
        onBalanceFetched={setTokenBalance}
      />
      <PacketSelector
        mode={packetMode} setMode={setPacketMode}
        capacity={capacity} setCapacity={setCapacity}
        identicalAmount={identicalAmount} setIdenticalAmount={setIdenticalAmount}
        totalAmount={totalAmount} setTotalAmount={setTotalAmount}
      />
      <WhitelistInput
        callback={callback}
      />
    </div>
  )
}