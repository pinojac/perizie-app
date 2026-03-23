export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query mancante' });

  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&prop=imageinfo&iiprop=url|mime|thumburl&iiurlwidth=400&format=json`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'NikolaElettroperizie/1.0' }
    });
    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});

    const imgPage = pages.find(p => {
      const mime = p.imageinfo?.[0]?.mime || '';
      return mime.startsWith('image/jpeg') || mime.startsWith('image/png') || mime.startsWith('image/webp');
    });

    const imgInfo = imgPage?.imageinfo?.[0];
    const imgUrl = imgInfo?.thumburl || imgInfo?.url || null;

    return res.status(200).json({ url: imgUrl });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
