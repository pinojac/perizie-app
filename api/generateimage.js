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
        prompt: `Close-up photorealistic image for electrical inspection manual. Show ONLY the specific electrical component being tested, with TWO multimeter probes physically touching the exact measurement points: one RED probe and one BLACK probe inserted or touching the terminals. The image must be EXTREMELY SPECIFIC to this test: ${prompt}. Requirements: macro close-up shot, white or neutral background, the component fills 80% of the frame, the red and black probes are clearly visible touching the exact correct terminals, photorealistic style like a professional technical manual photo, no text, no labels, no other tools visible except the two probes and the component under test.`,
        n: 1,
        size: '1024x1024',
        quality: 'hd'
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Errore OpenAI');

    const imageUrl = data.data[0].url;
    return res.status(200).json({ url: imageUrl });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
