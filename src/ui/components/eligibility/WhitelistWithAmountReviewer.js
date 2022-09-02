import WhitelistWithAmountInput from './WhitelistWithAmountInput'

export default function WhitelistWithAmountReviewer(props) {
  const { token, tokenBalance, callback } = props

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-y-10 rounded-3xl
    border-4 border-drizzle-green-light border-dashed">
      <WhitelistWithAmountInput
        token={token}
        tokenBalance={tokenBalance}
        callback={callback}
      />
    </div>
  )
}