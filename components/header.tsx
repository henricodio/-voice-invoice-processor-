"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, FileText, HelpCircle } from "lucide-react"
import Logo from "@/components/ui/logo"

export function Header() {
  const pathname = usePathname()
  
  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl flex items-center">
            <Logo width={160} height={48} className="hover:opacity-90 transition-opacity" />
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" passHref>
            <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" className="font-light tracking-wide">
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
          </Link>
          <Link href="/datos" passHref>
            <Button variant={pathname === "/datos" ? "default" : "ghost"} size="sm" className="font-light tracking-wide">
              <FileText className="h-4 w-4 mr-2" />
              Datos
            </Button>
          </Link>
          <Link href="/guia" passHref>
            <Button variant="outline" size="sm" className="font-light tracking-wide">
              <HelpCircle className="h-4 w-4 mr-2" />
              Guía de Usuario
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
