import DatePicker from 'react-datepicker'

export default function ReactDatePicker(props) {
  return (
    <div>
      <DatePicker
        className="focus:ring-drizzle-green-dark focus:border-drizzle-green-dark bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-lg placeholder:text-gray-300"
        showTimeSelect
        selected={props.date}
        onChange={(date) => props.setDate(date)}
        dateFormat="MMMM d, yyyy h:mm aa"
      />
    </div>
  )
}
