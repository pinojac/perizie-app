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
        from: 'Nikola ElettroPerizieAI <onboarding@resend.dev>',
        to: [to],
        subject: `Relazione perizia elettrica Nikola — ID ${id}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0f2740; padding: 24px; border-radius: 8px 8px 0 0;">
              <p style="color: #e8a020; font-size: 12px; margin: 0 0 4px; letter-spacing: 2px;">NIKOLA — ELETTROPERIZIE AI</p>
              <h1 style="color: white; font-size: 20px; margin: 0;">Relazione di Perizia Elettrica</h1>
            </div>
            <div style="background: #f8f9fb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #eef0f4;">
              <p style="color: #505868;">La perizia relativa alla pratica <strong>${id}</strong> è stata completata.</p>
              <p style="color: #505868;">In allegato trovi il PDF della relazione.</p>
              <p style="color: #505868; margin-top: 16px;"><strong>Riepilogo:</strong></p>
              <table style="width:100%; border-collapse: collapse; font-size: 14px; color: #505868;">
                <tr><td style="padding: 6px 0; border-bottom: 1px solid #eef0f4;"><strong>ID Pratica</strong></td><td style="padding: 6px 0; border-bottom: 1px solid #eef0f4;">${id}</td></tr>
                <tr><td style="padding: 6px 0; border-bottom: 1px solid #eef0f4;"><strong>Data</strong></td><td style="padding: 6px 0; border-bottom: 1px solid #eef0f4;">${new Date().toLocaleDateString('it-IT')}</td></tr>
                <tr><td style="padding: 6px 0;"><strong>File</strong></td><td style="padding: 6px 0;">${filename}</td></tr>
              </table>
              <p style="color: #9098a8; font-size: 12px; margin-top: 24px;">
                Documento generato da Nikola ElettroPerizieAI — riservato ad uso peritale.
              </p>
            </div>
          </div>
        `,
        attachments: pdfBase64 && filename ? [{ filename, content: pdfBase64 }] : undefined
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Errore invio email');
    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
