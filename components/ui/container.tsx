import { ReactNode } from "react"

export default function Container({ children } : {children : ReactNode}){
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex gap-2 min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {children}
      </main>
    </div>
  )
}
