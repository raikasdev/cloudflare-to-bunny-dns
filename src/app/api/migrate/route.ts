import axios from "axios";

export const dynamic = "force-dynamic"; // defaults to auto

export async function POST(request: Request) {
  const json = await request.json();
  const cloudflare = json.cloudflare;
  const bunny = json.bunny;
  if (!cloudflare || !bunny) {
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }

  // Verify cloudflare API key
  try {
    const res = await axios.get(
      "https://api.cloudflare.com/client/v4/user/tokens/verify",
      {
        headers: {
          Authorization: `Bearer ${cloudflare}`,
        },
      },
    );

    if (res.data.result.status !== "active") {
      return Response.json(
        { message: "Invalid Cloudflare API key" },
        { status: 400 },
      );
    }
  } catch (e) {
    return Response.json(
      { message: "Invalid Cloudflare API key" },
      { status: 400 },
    );
  }

  // Verify bunny.net API key
  try {
    await axios.get("https://api.bunny.net/dnszone", {
      headers: {
        AccessKey: bunny,
      },
    });
  } catch (e) {
    return Response.json(
      { message: "Invalid Bunny.net API key" },
      { status: 400 },
    );
  }

  // All good, now get all zones from Cloudflare
  let zones: any[] = [];

  const getZones = async (page = 1) => {
    const res = await axios.get(
      "https://api.cloudflare.com/client/v4/zones?per_page=50",
      {
        headers: {
          Authorization: `Bearer ${cloudflare}`,
        },
      },
    );

    zones = zones.concat(res.data.result);

    const totalPages = Math.ceil(
      res.data.result_info.total_count / res.data.result_info.per_page,
    );
    if (page < totalPages) {
      await getZones(page + 1);
    }
  };
  await getZones();

  zones = zones
    .filter((i) => i.status === "active")
    .map(({ name, id }) => ({ name, id })) as { name: string; id: string }[];

  // Go through all and check Bunny availability, then return list of available zones to user

  zones = await Promise.all(
    zones.map(async (zone) => {
      const res = await axios.post(
        "https://api.bunny.net/dnszone/checkavailability",
        {
          Name: zone.name,
        },
        {
          headers: {
            AccessKey: bunny,
          },
        },
      );

      return {
        name: zone.name,
        id: zone.id,
        canMigrate: res.data.Available === true,
      };
    }),
  );

  await Promise.all(
    zones
      .filter((i) => i.canMigrate)
      .map(async ({ id, name }) => {
        const exported = await axios.get(
          `https://api.cloudflare.com/client/v4/zones/${id}/dns_records/export`,
          {
            headers: {
              Authorization: `Bearer ${cloudflare}`,
            },
          },
        );

        const createRes = await axios.post(
          "https://api.bunny.net/dnszone",
          {
            Domain: name,
          },
          {
            headers: {
              AccessKey: bunny,
            },
          },
        );
        const bunnyId = createRes.data.Id;

        await axios.post(
          `https://api.bunny.net/dnszone/${bunnyId}/import`,
          exported.data,
          {
            headers: {
              "Content-Type": "application/octet-stream; charset=UTF-8",
              "content-disposition": "attachment; filename=import.txt",
              AccessKey: bunny,
            },
          },
        );
      }),
  );

  return Response.json({ zones });
}
