import FloatPicker from '../float/FloatPicker'
import PacketSelector from './PacketSelector'
import TokenSelector from './TokenSelector'

export default function FloatReviewer(props) {
  const { user, token, setToken, 
    tokenBalance, setTokenBalance, callback,
    floatMode
  } = props

  const [packetMode, setPacketMode] = useState(null)

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-y-10 rounded-3xl
    border-4 border-drizzle-green/30 border-dashed">
    <TokenSelector
      user={user}
      className="w-full"
      onTokenSelected={setToken}
      onBalanceFetched={setTokenBalance}
    />
    <PacketSelector mode={packetMode} setMode={setPacketMode} />
    <FloatPicker mode={floatMode} />
  </div>
  )
}