"use client";

import axios from "axios";
import { useState } from "react";

type Zone = { id: string; name: string; canMigrate: boolean };

export function App() {
  const [cloudflare, setCloudflare] = useState<string>("");
  const [bunny, setBunny] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<Zone[] | null>(null);

  const migrate = async (cloudflare: string, bunny: string) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/migrate", {
        cloudflare,
        bunny,
      });
      setZones(res.data.zones);
    } catch (e) {
      setError((e as any)?.response?.data?.message ?? "Invalid API key");
      setLoading(false);
    }
  };

  return (
    <>
      {null === zones && (
        <div className="flex flex-col gap-2">
          {error && <p className="text-red-500">{error}</p>}
          <label className="text-lg font-semibold" htmlFor="cf-api-key">
            Cloudflare API key
          </label>
          <p className="max-w-xl">
            You can create a API key{" "}
            <a
              className="underline hover:text-orange-600 transition-colors transition"
              href="https://dash.cloudflare.com/profile/api-tokens"
              target="_blank"
            >
              here
            </a>
            . Please select all zones and/or domains you want to migrate and
            make sure the &quot;DNS:Read&quot; permission is set.
          </p>
          <input
            id="cf-api-key"
            name="cf-api-key"
            type="password"
            placeholder="Cloudflare API key"
            className="border border-gray-300 text-black p-4 mb-4 w-full rounded-md"
            value={cloudflare}
            onChange={(e) => setCloudflare(e.target.value)}
          />
          <label className="text-lg font-semibold" htmlFor="bunny-api-key">
            Bunny.net API key
          </label>
          <p className="max-w-xl">
            You can find your API key{" "}
            <a
              className="underline hover:text-orange-600 transition-colors transition"
              href="https://dash.bunny.net/account/api-key"
              target="_blank"
            >
              here
            </a>
            .
          </p>
          <input
            id="bunny-api-key"
            name="bunny-api-key"
            type="password"
            placeholder="Bunny API key"
            className="border border-gray-300 text-black p-4 mb-4 w-full rounded-md"
            value={bunny}
            onChange={(e) => setBunny(e.target.value)}
          />
          <button
            className="bg-orange-400 text-black p-4 rounded-md disabled:bg-gray-400 transition-colors"
            disabled={loading}
            onClick={() => {
              migrate(cloudflare, bunny);
            }}
          >
            Migrate DNS
          </button>
        </div>
      )}
      {Array.isArray(zones) && (
        <div className="flex flex-col gap-2">
          <p className="text-bold">We migrated the following DNS zones:</p>
          <ul>
            {zones
              .filter((i) => i.canMigrate)
              .map((i) => (
                <li key={i.id} className="ml-4">{i.name}</li>
              ))}
          </ul>
          {zones.filter((i) => !i.canMigrate).length > 0 && (
            <>
              <p className="text-bold">
                We couldn&apos;t migrate these DNS zones because they are already
                registered on Bun  ny.net:
              </p>
              <ul>
                {zones
                  .filter((i) => !i.canMigrate)
                  .map((i) => (
                    <li key={i.id} className="ml-4">{i.name}</li>
                  ))}
              </ul>
            </>
          )}
          <p>
            Please check that all domains are registered properly in the
            Bunny.net dashboard and then set the nameservers :)
          </p>
        </div>
      )}
    </>
  );
}
