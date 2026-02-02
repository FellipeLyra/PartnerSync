import { LeadCandidate } from '../types';

const OVERPASS_MIRRORS = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
];
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

export const osmService = {
    /**
     * Geocodes a city name to get bounding box or center coordinates
     * @param query "City, State" or just "City"
     */
    geocodeCity: async (query: string) => {
        try {
            const url = `${NOMINATIM_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=1`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon),
                    displayName: data[0].display_name,
                    boundingBox: data[0].boundingbox // [minLat, maxLat, minLon, maxLon]
                };
            }
            return null;
        } catch (error) {
            console.error("Nominatim Error:", error);
            return null;
        }
    },

    /**
     * Searches OSM using Overpass API
     * @param tags Array of "key=value" strings (e.g. "amenity=gym")
     * @param location { type: 'RADIUS' | 'BOX', ... }
     */
    searchByTags: async (
        tags: string[],
        location: {
            type: 'RADIUS' | 'BOX';
            lat?: number;
            lon?: number;
            radiusKm?: number;
            box?: string[]; // [minLat, maxLat, minLon, maxLon]
        }
    ): Promise<LeadCandidate[]> => {
        // Construct Overpass QL query
        let areaFilter = '';
        if (location.type === 'RADIUS' && location.lat && location.lon && location.radiusKm) {
            // around:radius,lat,lon (radius in meters)
            areaFilter = `(around:${location.radiusKm * 1000},${location.lat},${location.lon})`;
        } else if (location.type === 'BOX' && location.box) {
            // (minLat, minLon, maxLat, maxLon)
            // Nominatim returns [minLat, maxLat, minLon, maxLon]
            // Overpass expects (south, west, north, east) -> (minLat, minLon, maxLat, maxLon)
            const [minLat, maxLat, minLon, maxLon] = location.box;
            areaFilter = `(${minLat},${minLon},${maxLat},${maxLon})`;
        }

        // Build the union of queries for each tag
        // node["amenity"="gym"](area); way["amenity"="gym"](area); relation["amenity"="gym"](area);
        const queries = tags.map(tag => {
            const [key, value] = tag.split('=');
            let tagFilter = `["${key}"]`;
            if (value && value !== '*') {
                tagFilter = `["${key}"="${value}"]`;
            } else if (value === '*') {
                tagFilter = `["${key}"]`; // Just existence of key
            }

            return `
                node${tagFilter}${areaFilter};
                way${tagFilter}${areaFilter};
                relation${tagFilter}${areaFilter};
            `;
        }).join('\n');

        const overpassQuery = `
            [out:json][timeout:25];
            (
                ${queries}
            );
            out center; 
        `; // 'out center' gives center coords for ways/relations

        let lastError: any = null;

        // Try each mirror until one works
        for (const mirrorUrl of OVERPASS_MIRRORS) {
            try {
                console.log(`Trying Overpass Mirror: ${mirrorUrl}`);
                const response = await fetch(mirrorUrl, {
                    method: 'POST',
                    body: `data=${encodeURIComponent(overpassQuery)}`
                });

                if (!response.ok) {
                    if (response.status === 400) {
                        const txt = await response.text();
                        console.error("Bad Request:", txt);
                        throw new Error(`Erro na busca: ${txt.substring(0, 100)}`);
                    }
                    if (response.status === 429) {
                        // Rate limited on this mirror, try next
                        throw new Error("Rate Limit (429)");
                    }
                    if (response.status >= 500) {
                        throw new Error(`Server Error (${response.status})`);
                    }

                    const errorText = await response.text();
                    throw new Error(`Erro HTTP ${response.status}: ${errorText.substring(0, 50)}`);
                }

                const result = await response.json();

                if (result.remark) {
                    console.warn("Overpass Remark:", result.remark);
                }

                if (!result.elements) return [];

                return result.elements.map((el: any) => {
                    const tags = el.tags || {};

                    // Try to format phone
                    let phone = tags['contact:phone'] || tags['phone'] || '';

                    // Try to find website/social
                    let website = tags['contact:website'] || tags['website'] || tags['url'] || tags['contact:url'] || '';
                    let instagram = tags['contact:instagram'] || tags['instagram'] || '';

                    // Check obscure tags
                    if (!instagram && tags['contact:social_media'] && tags['contact:social_media'].includes('instagram')) {
                        instagram = tags['contact:social_media'];
                    }

                    // Fallback for social if website is facebook/instagram
                    if (website.includes('instagram.com') && !instagram) instagram = website;

                    // Normalize Instagram (handle -> url)
                    if (instagram && !instagram.startsWith('http')) {
                        const handle = instagram.replace('@', '').trim();
                        if (handle) instagram = `https://www.instagram.com/${handle}`;
                    }

                    // City logic usually requires reverse geocoding or area context, 
                    // but sometimes it's in tags like 'addr:city'
                    const city = tags['addr:city'] || '';
                    const street = tags['addr:street'] || '';
                    const number = tags['addr:housenumber'] || '';
                    const address = street ? `${street}, ${number}` : '';

                    return {
                        id: `${el.type}/${el.id}`,
                        name: tags.name || tags.brand || 'Sem Nome',
                        address: address,
                        city: city,
                        phone: phone,
                        website: website,
                        instagram: instagram,
                        osmTags: tags,
                        lat: el.lat || el.center?.lat,
                        lon: el.lon || el.center?.lon,
                        status: 'NEW' // Default status
                    } as LeadCandidate;
                });

            } catch (error) {
                console.warn(`Mirror failed (${mirrorUrl}):`, error);
                lastError = error;

                // If Bad Request, stop trying mirrors (they will all fail)
                if (error instanceof Error && error.message.includes('Erro na busca')) {
                    throw error;
                }

                // Optional: small delay before next mirror?
            }
        }

        // If loop completes without return
        console.error("All Overpass mirrors failed.");
        if (lastError instanceof Error) throw lastError;
        throw new Error("Todos os servidores do OpenStreetMap estão ocupados. Tente novamente em alguns minutos.");
    }
};
