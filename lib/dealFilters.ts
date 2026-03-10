const MEAT_KEYWORDS = [
  "BEEF", "GROUND BEEF", "STEAK", "BRISKET", "RIBEYE", "SIRLOIN",
  "STRIPLOIN", "TENDERLOIN", "SHORT RIB", "CHUCK", "T-BONE", "FLANK",
  "CHICKEN", "BREAST", "THIGH", "DRUMSTICK", "WINGS", "WHOLE CHICKEN",
  "ROTISSERIE", "PORK", "BACON", "HAM", "RIBS", "PORK CHOP",
  "PROSCIUTTO", "PANCETTA", "TURKEY", "TURKEY BREAST", "GROUND TURKEY",
  "LAMB", "VEAL", "BISON", "VENISON", "DUCK", "GOOSE", "SAUSAGE",
  "HOT DOG", "WIENER", "PEPPERONI", "SALAMI", "CHORIZO", "BRATWURST",
  "DELI MEAT", "COLD CUTS", "BOLOGNA", "PASTRAMI", "MORTADELLA",
];

const FISH_KEYWORDS = [
  "TUNA", "SALMON", "TILAPIA", "COD", "HALIBUT", "TROUT", "BASS",
  "SNAPPER", "MAHI", "SHRIMP", "LOBSTER", "CRAB", "SCALLOP", "CLAM",
  "MUSSEL", "OYSTER", "SQUID", "OCTOPUS", "FISH", "SEAFOOD", "FILLET",
  "SARDINE", "ANCHOVY", "HERRING", "MACKEREL",
];

const DAIRY_KEYWORDS = [
  "MILK", "CHEESE", "BUTTER", "YOGURT", "CREAM", "SOUR CREAM",
  "CREAM CHEESE", "COTTAGE CHEESE", "MOZZARELLA", "CHEDDAR", "PARMESAN",
  "BRIE", "FETA", "WHEY", "GHEE", "KEFIR", "ICE CREAM",
];

const EGG_KEYWORDS = ["EGG", "EGGS"];

const PORK_KEYWORDS = [
  "PORK", "BACON", "HAM", "RIBS", "PORK CHOP", "PROSCIUTTO", "PANCETTA",
  "SAUSAGE", "HOT DOG", "WIENER", "PEPPERONI", "SALAMI", "CHORIZO",
  "BRATWURST",
];

const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  Nuts: ["PEANUT", "ALMOND", "CASHEW", "WALNUT", "PECAN", "PISTACHIO", "NUT"],
  Dairy: ["MILK", "CHEESE", "BUTTER", "YOGURT", "CREAM", "WHEY"],
  Gluten: ["BREAD", "PASTA", "FLOUR", "WHEAT", "BARLEY", "CRACKER", "CEREAL"],
  Shellfish: ["SHRIMP", "LOBSTER", "CRAB", "SCALLOP", "CLAM", "MUSSEL"],
  Eggs: ["EGG", "EGGS"],
  Soy: ["SOY", "TOFU", "EDAMAME"],
};

function getBlockedKeywordsForDiet(dietaryStyle: string): string[] {
  const diet = dietaryStyle.split("—")[0].trim();
  switch (diet) {
    case "Vegetarian":
      return [...MEAT_KEYWORDS, ...FISH_KEYWORDS];
    case "Vegan":
      return [...MEAT_KEYWORDS, ...FISH_KEYWORDS, ...DAIRY_KEYWORDS, ...EGG_KEYWORDS];
    case "Pescatarian":
      return [...MEAT_KEYWORDS];
    case "Halal":
    case "Kosher":
      return [...PORK_KEYWORDS];
    default:
      return [];
  }
}

function getBlockedKeywordsForAllergens(allergies: string[]): string[] {
  const blocked: string[] = [];
  for (const allergy of allergies) {
    if (allergy === "None") continue;
    const keywords = ALLERGEN_KEYWORDS[allergy];
    if (keywords) blocked.push(...keywords);
  }
  return blocked;
}

function nameContainsKeyword(productName: string, keywords: string[]): boolean {
  const upper = productName.toUpperCase();
  return keywords.some((kw) => upper.includes(kw));
}

export function filterDeals(deals: any[], profile: any | null): any[] {
  if (!profile) return deals;

  let result = deals;

  // Store filter
  const favStores: string[] | undefined = profile.favourite_stores;
  if (
    favStores &&
    Array.isArray(favStores) &&
    favStores.length > 0 &&
    !favStores.includes("No preference")
  ) {
    result = result.filter((d) => favStores.includes(d.store));
  }

  // Dietary filter
  const dietBlocked = getBlockedKeywordsForDiet(profile.dietary_style || "");
  if (dietBlocked.length > 0) {
    result = result.filter((d) => !nameContainsKeyword(d.product_name || "", dietBlocked));
  }

  // Allergen filter — stored as comma-separated string like "Nuts, Soy"
  const rawAllergies = profile.allergies || "";
  const allergies: string[] = typeof rawAllergies === "string"
    ? rawAllergies.split(",").map((s: string) => s.trim()).filter(Boolean)
    : rawAllergies;
  const allergenBlocked = getBlockedKeywordsForAllergens(allergies);
  if (allergenBlocked.length > 0) {
    result = result.filter((d) => !nameContainsKeyword(d.product_name || "", allergenBlocked));
  }

  return result;
}
