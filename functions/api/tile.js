export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const tilePath = url.searchParams.get('p');
    if (!tilePath) {
        return new Response(null, { status: 404 });
    }
    // tilePath 格式: z/x/y, 例如 6/53/24
    // 用 CartoDB 浅色瓦片（基于 OSM 数据，免费，无需 Key）
    const [z, x, y] = tilePath.split('/');
    const sd = String(((parseInt(x) + parseInt(y)) % 4) + 1);
    const tileUrl = `https://${sd}.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`;
    try {
        const resp = await fetch(tileUrl);
        const blob = await resp.blob();
        return new Response(blob, {
            headers: {
                'content-type': 'image/png',
                'cache-control': 'public, max-age=86400',
                'access-control-allow-origin': '*',
            },
        });
    } catch {
        return new Response(null, { status: 502 });
    }
}
