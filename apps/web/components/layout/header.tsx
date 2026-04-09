"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { NavItem } from "@/content/home";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { MenuIcon, XIcon } from "@/components/ui/icons";
import { SearchInput } from "@/components/ui/search-input";
import { CORINTHIANS_CREST_URL } from "@/lib/assets";
import { cn } from "@/lib/cn";

interface HeaderProps {
  navigation: NavItem[];
}

export function Header({ navigation }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-app/88 backdrop-blur-xl">
      <Container className="flex min-h-[var(--header-height)] items-center gap-4 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <Link
            href="/"
            className="group inline-flex min-w-0 items-center gap-4 rounded-[var(--radius-full)] pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-app"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5">
              <Image
                src={CORINTHIANS_CREST_URL}
                alt="Escudo do Corinthians"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                unoptimized
              />
            </span>
            <span className="min-w-0">
              <span className="editorial-kicker block text-white/46">Portal</span>
              <span className="block truncate font-display text-3xl uppercase leading-none tracking-[0.04em] text-white">
                Corinthians
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex" aria-label="Navegação principal">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ink-secondary transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
              >
                {item.label}
                {item.badge ? <Badge variant="live">{item.badge}</Badge> : null}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden w-full max-w-sm xl:block">
          <SearchInput />
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-white/20 hover:bg-white/10 lg:hidden"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </Container>

      <div className={cn("border-t border-white/8 bg-app/96 lg:hidden", isOpen ? "block" : "hidden")}>
        <Container className="space-y-4 py-4">
          <SearchInput />
          <nav className="flex flex-col gap-2" aria-label="Navegação mobile">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-[var(--radius-lg)] border border-white/8 bg-white/4 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/86"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{item.label}</span>
                  {item.badge ? <Badge variant="live">{item.badge}</Badge> : null}
                </span>
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}
