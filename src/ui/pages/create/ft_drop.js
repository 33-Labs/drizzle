import DropCreator from '../../components/drop/DropCreator'

export default function NewDrop(props) {
  return (
    <>
      <div className="container mx-auto max-w-[920px] min-w-[380px] px-6">
        <DropCreator user={props.user} />
      </div>
    </>
  )
}