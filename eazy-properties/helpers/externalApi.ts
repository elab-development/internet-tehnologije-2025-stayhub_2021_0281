type GeoapifyPlace = {
  properties: {
    name?: string;
    formatted?: string;
    categories?: string[];
    distance?: number;
  };
};

const cityToZone: Record<string, string> = {
  Belgrade: "RS",
  Paris: "FR",
  London: "GB",
  Dubai: "AE",
  Tokyo: "JP",
  Sydney: "AU-NSW",
  Moscow: "RU",
  Newyork: "US-NY-NYIS",
  "New York": "US-NY-NYIS",
  Singapore: "SG",
  Singapoore: "SG",
  Beijing: "CN",
  Bejing: "CN",
};

export async function readJsonSafely(response: Response) {
  // Nekad API vrati prazan odgovor ili običan tekst, zato prvo čitamo kao tekst.
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      raw: text,
    };
  }
}

export async function getElectricityCarbonData(city: string, requestedZone?: string) {
  const apiKey = process.env.ELECTRICITY_MAPS_API_KEY;
  const defaultZone = process.env.ELECTRICITY_MAPS_DEFAULT_ZONE || "RS";

  if (!apiKey) {
    throw new Error("Electricity Maps API key is missing.");
  }

  // Ako je prosleđena zona, koristimo nju.
  // Ako nije, tražimo zonu po gradu.
  // Ako ni to ne postoji, koristimo default zonu iz .env fajla.
  const zone = requestedZone || cityToZone[city] || defaultZone;

  const response = await fetch(
    `https://api.electricitymaps.com/v3/carbon-intensity/latest?zone=${encodeURIComponent(
      zone
    )}`,
    {
      method: "GET",
      headers: {
        "auth-token": apiKey,
      },
      cache: "no-store",
    }
  );

  const result = await readJsonSafely(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        "Electricity Maps request failed. Check your API key and make sure the zone matches the zone selected for your Free Tier key.",
      zone,
      error: result,
    };
  }

  return {
    ok: true,
    data: {
      city,
      zone: result.zone || zone,

      // Electricity Maps vraća carbonIntensity u gCO2eq/kWh.
      carbonIntensity: result.carbonIntensity,

      // API može vratiti informaciju da li je vrednost procenjena.
      isEstimated: result.isEstimated ?? false,

      // Vreme kada je podatak važeći.
      datetime: result.datetime,

      // Tip faktora emisije ako postoji u odgovoru.
      emissionFactorType: result.emissionFactorType || "lifecycle",
    },
  };
}

export async function getNearbyPlacesData(
  city: string,
  address: string,
  category: string
) {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("Geoapify API key is missing.");
  }

  if (!city) {
    return {
      ok: false,
      status: 400,
      message: "City is required.",
    };
  }

  const fullAddress = `${address}, ${city}`;

  // Prvo pretvaramo adresu u koordinate.
  const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    fullAddress
  )}&format=json&apiKey=${apiKey}`;

  const geocodingResponse = await fetch(geocodingUrl, {
    cache: "no-store",
  });

  const geocodingData = await readJsonSafely(geocodingResponse);

  if (!geocodingResponse.ok) {
    return {
      ok: false,
      status: geocodingResponse.status,
      message: "Geoapify geocoding request failed.",
      error: geocodingData,
    };
  }

  const firstResult = geocodingData.results?.[0];

  if (!firstResult) {
    return {
      ok: false,
      status: 404,
      message: "Location could not be found.",
    };
  }

  const latitude = firstResult.lat;
  const longitude = firstResult.lon;

  // Zatim tražimo mesta u krugu od 2km oko nekretnine.
  const placesUrl = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(
    category
  )}&filter=circle:${longitude},${latitude},2000&bias=proximity:${longitude},${latitude}&limit=8&apiKey=${apiKey}`;

  const placesResponse = await fetch(placesUrl, {
    cache: "no-store",
  });

  const placesData = await readJsonSafely(placesResponse);

  if (!placesResponse.ok) {
    return {
      ok: false,
      status: placesResponse.status,
      message: "Geoapify places request failed.",
      error: placesData,
    };
  }

  const places = (placesData.features || []).map((place: GeoapifyPlace) => ({
    name: place.properties.name || "Unnamed place",
    address: place.properties.formatted || "No address available",
    categories: place.properties.categories || [],
    distance: place.properties.distance || null,
  }));

  return {
    ok: true,
    data: {
      location: {
        city,
        address,
        latitude,
        longitude,
      },
      category,
      places,
    },
  };
}