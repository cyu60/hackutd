import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Logo from "@/public/img/logo.png"

export default function LandingPage() {
  return (
    <div className="h-screen"
      style={{
        background: "linear-gradient(to bottom, #FFFFFF 17%, #163286 66%, #000000 100%)",
      }}
    >
      <header className="p-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Image
            src={Logo}
            alt="DealDrill Logo"
            width={32}
            height={32}
          />
          <span className="font-bold text-2xl p-4  text-[#163286]">DealDrill</span>
        </Link>
        <nav className="ml-auto flex py-2 gap-4 sm:gap-6">
          <Link
            className="text-md p-2 rounded-md font-bold bg-[#163286] hover:font-bold hover:bg-[#495d9c] text-white"
            href="#"
          >
            Log In
          </Link>
          <Link
            className="text-md p-2 font-bold hover:font-bold underline-offset-4 text-black"
            href="#"
          >
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
      <section className="w-full py-10 md:py-15 lg:py-20 flex items-center justify-center">
          <div className="container px-4 md:px-6 flex flex-col items-center min-h-screen">
            <div className="flex flex-col items-center justify-center space-y-4 text-center w-full">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-black">
                  Sharpen Your Sales Skills with AI-Powered Precision
                </h1>
                <p className="mx-auto max-w-[700px] text-sm text-zinc-700 md:text-3xl">
                  powered by <span className="italic"> Pinata </span> and <span className="italic"> Samba Nova </span>
                </p>
              </div>
              <Button
                className="inline-flex h-12 items-center justify-center rounded-full px-8 text-base font-medium !bg-black text-white"
              >
                <Link href="/demo" className="flex items-center">
                  Start Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div>
              {/* Landing page image placeholder */}
              {/* <Image
                src="/images/hero.svg"
                alt="Hero"
                width={700}
                height={700}
              /> */}
              </div>
            </div>
        </section>
      </main>
    </div>
  )
}