export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({ error: 'OpenAI API key non configurata' });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Technical illustration for electrical inspection. ${prompt}. Style: clean photorealistic illustration, white background, showing clearly where to place multimeter probes (red probe and black probe), labeled in Italian, professional technical manual style, no text overlays except labels.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore OpenAI');

    const imageUrl = data.data[0].url;

    // Scarica l'immagine e la restituisce come base64
    const imgResponse = await fetch(imageUrl);
    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return res.status(200).json({ image: base64, mimeType: 'image/png' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
