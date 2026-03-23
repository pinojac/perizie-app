export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query mancante' });

  // Prova la query originale, poi versioni semplificate come fallback
  const queries = [
    query,
    query.split(' ').slice(0, 2).join(' '), // prime 2 parole
    query.split(' ')[0] // solo prima parola
  ];

  try {
    for (const q of queries) {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=15&prop=imageinfo&iiprop=url|mime|thumburl&iiurlwidth=400&format=json`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'NikolaElettroperizie/1.0 (perizie elettriche)' }
      });
      const data = await response.json();
      const pages = Object.values(data.query?.pages || {});

      const imgPage = pages.find(p => {
        const mime = p.imageinfo?.[0]?.mime || '';
        const url = p.imageinfo?.[0]?.url || '';
        // Escludi icone, loghi, SVG, immagini troppo piccole
        return (mime.startsWith('image/jpeg') || mime.startsWith('image/png') || mime.startsWith('image/webp'))
          && !url.includes('Icon') && !url.includes('Logo') && !url.includes('logo');
      });

      const imgInfo = imgPage?.imageinfo?.[0];
      const imgUrl = imgInfo?.thumburl || imgInfo?.url || null;

      if (imgUrl) {
        return res.status(200).json({ url: imgUrl });
      }
    }

    return res.status(200).json({ url: null });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
