export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    if (!name) {
        return new Response(JSON.stringify({ error: 'missing name' }), {
            headers: { 'content-type': 'application/json' },
            status: 400,
        });
    }
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=zh&format=json`;
    try {
        const resp = await fetch(apiUrl, {
            headers: { 'User-Agent': 'WeatherMap/1.0' }
        });
        if (!resp.ok) {
            return new Response(JSON.stringify({ error: 'geocode ' + resp.status }), {
                headers: { 'content-type': 'application/json' },
                status: resp.status,
            });
        }
        const data = await resp.json();
        // 转换为简化的格式
        const results = (data.results || []).map(r => ({
            name: r.name,
            country: r.country || '',
            admin1: r.admin1 || '',
            lat: r.latitude,
            lon: r.longitude,
            countryCode: r.country_code,
        }));
        return new Response(JSON.stringify({ results }), {
            headers: { 'content-type': 'application/json' },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { 'content-type': 'application/json' },
            status: 502,
        });
    }
}
