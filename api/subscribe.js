// Vercel serverless function: subscribes an email to the Fun Sized Eggplant Beehiiv publication.
// The API key is read from the BEEHIIV_API_KEY environment variable and never exposed to the client.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    const email = ((body && body.email) || '').trim();
    if (!email || email.indexOf('@') < 1) {
      res.status(400).json({ ok: false, error: 'Enter a valid email.' });
      return;
    }

    const KEY = process.env.BEEHIIV_API_KEY;
    const PUB = process.env.BEEHIIV_PUBLICATION_ID || 'pub_c610c241-b7f0-4eb4-991b-3cb03e35f39d';
    if (!KEY) {
      res.status(500).json({ ok: false, error: 'Signup is not configured yet. Check back soon!' });
      return;
    }

    const r = await fetch(`https://api.beehiiv.com/v2/publications/${PUB}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'funsizedeggplant.com',
        utm_medium: 'landing-page'
      })
    });

    const data = await r.json().catch(() => ({}));
    if (r.ok) {
      res.status(200).json({ ok: true });
    } else {
      const msg = (data && data.errors && data.errors[0] && data.errors[0].message) || 'Could not subscribe right now.';
      res.status(r.status).json({ ok: false, error: msg });
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Server error. Try again.' });
  }
};
