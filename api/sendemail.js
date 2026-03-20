export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return res.status(500).json({ error: 'Resend API key non configurata' });
  }

  const { to, id, pdfBase64, filename } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'PeriziApp <noreply@periziapp.it>',
        to: [to],
        subject: `Relazione perizia elettrica — ID ${id}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0f2740; padding: 24px; border-radius: 8px 8px 0 0;">
              <p style="color: #e8a020; font-size: 12px; margin: 0 0 4px;">PERIZIAPP</p>
              <h1 style="color: white; font-size: 20px; margin: 0;">Relazione di Perizia Elettrica</h1>
            </div>
            <div style="background: #f8f9fb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #eef0f4;">
              <p style="color: #505868;">In allegato la relazione relativa alla pratica <strong>${id}</strong>.</p>
              <p style="color: #505868;">Il documento contiene:</p>
              <ul style="color: #505868;">
                <li>Documentazione fotografica</li>
                <li>Ente identificato dall'AI</li>
                <li>Risultati dei test con multimetro</li>
                <li>Diagnosi finale</li>
              </ul>
              <p style="color: #9098a8; font-size: 12px; margin-top: 24px;">
                Documento generato da PeriziApp — riservato ad uso peritale.
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: filename,
            content: pdfBase64
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Errore invio email');
    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
