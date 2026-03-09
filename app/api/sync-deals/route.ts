import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const TARGET_STORES = [
  "No Frills",
  "Loblaws",
  "Real Canadian Superstore",
  "FreshCo",
  "Metro",
];

const ZONES = [
  { name: "Downtown", postal_code: "M5V3A8" },
  { name: "Scarborough", postal_code: "M1E1C6" },
  { name: "North York", postal_code: "M2N1A1" },
  { name: "Brampton", postal_code: "L6Y1A1" },
];

function flippFlyersUrl(postalCode: string) {
  return `https://dam.flippenterprise.net/api/flipp/data?locale=en&postal_code=${postalCode}&sid=5503157215867733`;
}

function flippItemsUrl(flyerId: number) {
  return `https://dam.flippenterprise.net/api/flipp/flyers/${flyerId}/flyer_items?locale=en`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

export async function GET(request: NextRequest) {
  // Auth check (skip in development)
  if (process.env.NODE_ENV !== "development") {
    const secret = request.headers.get("x-sync-secret");
    if (!secret || secret !== process.env.SYNC_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getServiceSupabase();
  const errors: string[] = [];
  let totalItems = 0;
  let storesSynced = 0;
  let zonesSynced = 0;
  const fetchedFlyerIds = new Set<number>();

  try {
    // 1. Iterate through each zone
    for (let z = 0; z < ZONES.length; z++) {
      const zone = ZONES[z];

      if (z > 0) {
        console.log(`Waiting 3s before next zone...`);
        await delay(3000);
      }

      console.log(`\n--- Zone: ${zone.name} (${zone.postal_code}) ---`);
      const flyersRes = await fetch(flippFlyersUrl(zone.postal_code));
      if (!flyersRes.ok) {
        const msg = `Zone ${zone.name}: Failed to fetch flyers (HTTP ${flyersRes.status})`;
        console.error(msg);
        errors.push(msg);
        continue;
      }
      const flyersData = await flyersRes.json();
      const allFlyers = flyersData.flyers ?? [];

      // 2. Filter to target stores
      const matchedFlyers = allFlyers.filter((f: any) => {
        const name = (f.merchant || f.merchant_name || f.name || "").toLowerCase().trim();
        return TARGET_STORES.some(s => name.includes(s.toLowerCase()));
      });
      console.log(
        `${zone.name}: ${matchedFlyers.length} matching flyers out of ${allFlyers.length} total`
      );

      // 3. For each matched flyer, fetch items and upsert (skip if already fetched)
      let flyersFetched = 0;
      for (const flyer of matchedFlyers) {
        const storeName: string = flyer.merchant;
        const flyerId: number = flyer.id;

        if (fetchedFlyerIds.has(flyerId)) {
          console.log(`Skipping flyer ${flyerId} (${storeName}) — already fetched`);
          continue;
        }
        fetchedFlyerIds.add(flyerId);

        try {
          if (flyersFetched > 0 || z > 0) {
            console.log("Waiting 2s before next flyer...");
            await delay(2000);
          }

          console.log(`Fetching items for ${storeName} (flyer ${flyerId})...`);
          const itemsRes = await fetch(flippItemsUrl(flyerId));
          if (!itemsRes.ok) {
            throw new Error(`HTTP ${itemsRes.status}`);
          }
          const items: Array<{
            id: number;
            flyer_id: number;
            name: string;
            brand: string | null;
            current_price: string | null;
            price: string | null;
            cutout_image_url: string | null;
            valid_from: string;
            valid_to: string;
          }> = await itemsRes.json();

          // Build rows, skipping items with no valid price
          const rows = [];
          for (const item of items) {
            const salePrice = parseFloat(item.current_price ?? item.price ?? "");
            if (isNaN(salePrice)) continue;

            rows.push({
              flyer_item_id: item.id,
              flyer_id: item.flyer_id,
              store: storeName,
              product_name: item.name,
              brand: item.brand ?? null,
              sale_price: salePrice,
              regular_price: null,
              unit: null,
              category: null,
              image_url: item.cutout_image_url ?? null,
              valid_from: item.valid_from,
              valid_to: item.valid_to,
            });
          }

          if (rows.length > 0) {
            const { error } = await supabase
              .from("deals")
              .upsert(rows, { onConflict: "flyer_item_id" });

            if (error) {
              throw new Error(`Supabase upsert failed: ${error.message}`);
            }
          }

          console.log(
            `${storeName}: ${rows.length} items synced (${items.length} total, ${items.length - rows.length} skipped)`
          );
          totalItems += rows.length;
          storesSynced++;
          flyersFetched++;
        } catch (err) {
          const msg = `${storeName}: ${err instanceof Error ? err.message : String(err)}`;
          console.error(msg);
          errors.push(msg);
        }
      }

      zonesSynced++;
    }
  } catch (err) {
    console.error("Fatal error during sync:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  const summary = {
    success: errors.length === 0,
    zones_synced: zonesSynced,
    stores_synced: storesSynced,
    total_items: totalItems,
    synced_at: new Date().toISOString(),
    ...(errors.length > 0 && { errors }),
  };

  console.log("Sync complete:", summary);
  return NextResponse.json(summary);
}
