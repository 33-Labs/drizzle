import WhitelistWithAmountInput from './WhitelistWithAmountInput'
import TokenSelector from './TokenSelector'

export default function WhitelistWithAmountReviewer(props) {
  const {user, token, setToken, tokenBalance, setTokenBalance, callback} = props

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-y-10 rounded-3xl
    border-4 border-drizzle-green/30 border-dashed">
    <TokenSelector
      user={user}
      className="w-full"
      onTokenSelected={setToken}
      onBalanceFetched={setTokenBalance}
    />
    <WhitelistWithAmountInput
      token={token}
      tokenBalance={tokenBalance}
      callback={callback}
    />
  </div>
  )
}