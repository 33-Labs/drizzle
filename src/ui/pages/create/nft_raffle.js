import RaffleCreator from '../../components/raffle/RaffleCreator'

export default function NewRaffle(props) {
  return (
    <>
      <div className="container mx-auto max-w-[920px] min-w-[380px] px-6">
        <RaffleCreator user={props.user} />
      </div>
    </>
  )
}