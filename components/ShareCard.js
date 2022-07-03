import { QRCode } from 'react-qrcode-logo'

export default function ShareCard() {
  return (
    <>
    <label className="text-2xl font-bold font-flow">share this drop</label>

    <div className="flex flex-col gap-y-3 min-w-[320px] shadow-[0px_5px_25px_-5px_rgba(0,0,0,0.1)] mt-5 mb-10 items-center">
      <div className="bg-drizzle-green mt-6">
        <QRCode 
          value="https://github.com/gcoro/react-qrcode-logo" 
          qrStyle="dots"
          fgColor="#58D27D"
        />
      </div>

      <label className="text-lg font-bold font-flow">or</label>

      <div className="w-full px-6 pb-6">
        <div className="w-full mt-1 flex justify-between">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <input
              type="text"
              name="url"
              id="url"
              className="focus:ring-0 focus:border-drizzle-green bg-drizzle-green/10 block w-full border-drizzle-green font-flow text-sm"
              contentEditable={false}
              defaultValue={"https://www.drizzle.com/121212/1212/1212/1212"}
            />
          </div>
          <button
            type="button"
            className="-ml-px px-4 py-2 text-sm font-medium  text-gray-700 bg-drizzle-green hover:bg-drizzle-green-dark focus:outline-none"
          >
            <span>copy</span>
          </button>
        </div>
      </div>
      </div>  
    </>
  )
}