import Landing from '../components/Landing'

export default function Home(props) {
  return (
    <>
    <div className="container mx-auto max-w-[920px] min-w-[380px] px-6">
      <Landing user={props.user} auth={props.auth}/>
    </div>
    </>
  )
}
