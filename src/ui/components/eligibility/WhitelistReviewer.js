import WhitelistInput from './WhitelistInput'

export default function WhitelistReviewer(props) {
  const { callback } = props

  return (
    <div className="p-4 sm:p-8 flex flex-col gap-y-10 rounded-3xl
    border-4 border-drizzle-green-light border-dashed">
      <WhitelistInput
        callback={callback}
      />
    </div>
  )
}