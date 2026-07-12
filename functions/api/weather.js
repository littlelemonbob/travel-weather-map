export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const lats = url.searchParams.get('lats');
    const lons = url.searchParams.get('lons');

    if (!lats || !lons) {
        return new Response(JSON.stringify({ error: 'missing params' }), {
            headers: { 'content-type': 'application/json' },
            status: 400,
        });
    }

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=Asia/Shanghai&forecast_days=7`;

    try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 20000);
        const resp = await fetch(apiUrl, { signal: ctrl.signal });
        clearTimeout(timer);
        const data = await resp.json();
        return new Response(JSON.stringify(data), {
            headers: { 'content-type': 'application/json' },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { 'content-type': 'application/json' },
            status: 502,
        });
    }
}
