import DropCreator from '../components/DropCreator'

export default function NewDrop(props) {
  return (
    <>
      <div className="container mx-auto max-w-[880px] min-w-[380px] px-6">
        <DropCreator user={props.user} />
      </div>
    </>
  )
}