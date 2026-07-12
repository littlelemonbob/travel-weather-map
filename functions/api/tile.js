export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const tilePath = url.searchParams.get('p');
    if (!tilePath) {
        return new Response(null, { status: 404 });
    }
    // tilePath 格式: z/x/y, 例如 6/53/24
    const [z, x, y] = tilePath.split('/');
    // 高德中文地图瓦片（全球中文标注）
    const sd = String(((parseInt(x) + parseInt(y)) % 4) + 1);
    const tileUrl = `https://webrd0${sd}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=${x}&y=${y}&z=${z}`;
    try {
        const resp = await fetch(tileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WeatherMap/1.0)',
                'Referer': 'https://travel-weather-map.pages.dev/',
            }
        });
        if (!resp.ok) {
            // 高德失败时降级到 CartoDB 英文（至少地图能显示）
            const fallback = await fetch(`https://${sd}.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`);
            const fallbackBlob = await fallback.blob();
            return new Response(fallbackBlob, {
                headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' }
            });
        }
        const blob = await resp.blob();
        return new Response(blob, {
            headers: {
                'content-type': 'image/png',
                'cache-control': 'public, max-age=86400',
            },
        });
    } catch {
        // 出错时降级到 CartoDB
        try {
            const fallback = await fetch(`https://${sd}.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`);
            const blob = await fallback.blob();
            return new Response(blob, {
                headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' }
            });
        } catch {
            return new Response(null, { status: 502 });
        }
    }
}
