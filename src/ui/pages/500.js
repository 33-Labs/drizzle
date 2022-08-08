export default function Custom500() {
  return (
    <>
      <div className="min-h-[40vh] px-8 py-16 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <p className="text-3xl font-bold text-red-400 sm:text-4xl">500</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">Server-side error occurred</h1>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}