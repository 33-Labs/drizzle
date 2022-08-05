import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'

export default function ClaimedModal(props) {
  const router = useRouter()
  const { open, setOpen, rewardInfo, title } = props

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm w-full sm:p-6">
                <div>
                  <label className="block w-full h-[80px] text-center text-[60px]">🎉</label>
                  <div className="mt-3 text-center sm:mt-5">
                    {
                      rewardInfo ?
                        <Dialog.Title as="h3" className="text-2xl leading-10 font-semibold text-drizzle-green">
                          {`${rewardInfo}`}
                        </Dialog.Title> : null
                    }
                    <Dialog.Title as="h3" className="text-xl leading-10 font-semibold text-gray-900">
                      {title}
                    </Dialog.Title>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-2xl border border-transparent shadow-sm px-4 py-2 bg-drizzle-green text-base font-semibold hover:bg-drizzle-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle-green sm:text-sm"
                    onClick={() => {
                      setOpen(false)
                    }}
                  >
                    HOORAY!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}