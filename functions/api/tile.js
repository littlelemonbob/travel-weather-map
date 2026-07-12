export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);
    const tilePath = url.searchParams.get('p');
    if (!tilePath) {
        return new Response(null, { status: 404 });
    }
    // tilePath 格式: z/x/y, 例如 6/53/24
    const tileUrl = 'https://tile.openstreetmap.org/' + tilePath + '.png';
    try {
        const resp = await fetch(tileUrl);
        const blob = await resp.blob();
        return new Response(blob, {
            headers: {
                'content-type': 'image/png',
                'cache-control': 'public, max-age=86400',
            },
        });
    } catch {
        return new Response(null, { status: 502 });
    }
}
