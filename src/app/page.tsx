import { App } from "@/components/App";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <h1 className="text-3xl text-center font-semibold mb-4">
        Automatically migrate domains from Cloudflare to Bunny.net 🐇
      </h1>
      <p className="mb-2 text-center">
        All open source.{" "}
        <a
          className="underline hover:text-purple-600 transition-colors transition"
          href="https://github.com/raikasdev/cloudflare-to-bunny-dns"
        >
          View source code
        </a>
        . Made with love in Finland 🇫🇮 by{" "}
        <a
          className="underline hover:text-purple-400 transition-colors transition"
          href="https://mementomori.social/@raikas"
        >
          Roni Äikäs
        </a>
      </p>
      <p className="mb-6 text-center">
        Easily migrate all your domains DNS records from Cloudflare to the
        European{" "}
        <a
          className="underline hover:text-orange-600 transition-colors transition"
          href="https://bunny.net"
        >
          Bunny.net
        </a>
        .
      </p>
      <App />
    </main>
  );
}
