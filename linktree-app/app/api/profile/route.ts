import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, display_name, links } = body;

    // 1. Validate input
    if (!username || !display_name || !Array.isArray(links)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Sanitize username (alphanumeric and hyphens only for subdomain)
    const usernameRegex = /^[a-zA-Z0-9-]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username must be alphanumeric and can contain hyphens.' },
        { status: 400 }
      );
    }

    // Validate links to prevent javascript: XSS
    for (const link of links) {
      if (!link.title || !link.url) {
        return NextResponse.json({ error: 'Invalid link format' }, { status: 400 });
      }
      if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
        return NextResponse.json({ error: 'Links must start with http or https' }, { status: 400 });
      }
    }

    // 2. Insert into Database using parameterized queries
    const client = await pool.connect();
    try {
      const insertQuery = `
        INSERT INTO profiles (username, display_name, links)
        VALUES ($1, $2, $3)
        RETURNING id;
      `;
      const values = [username, display_name, JSON.stringify(links)];
      await client.query(insertQuery, values);
    } catch (dbError: any) {
      // Handle unique constraint violation (username already taken)
      if (dbError.code === '23505') {
        return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
      }
      throw dbError;
    } finally {
      client.release();
    }

    // 3. Trigger Webhook
    // Use a placeholder if WEBHOOK_URL is not provided
    const webhookUrl = process.env.WEBHOOK_URL || 'https://httpbin.org/post';
    const bearerToken = process.env.BEARER_TOKEN || '';
    const targetDestination = process.env.TARGET_DESTINATION || 'calhacked.tech'; // fallback value
    
    const webhookPayload = {
      type: "CNAME",
      name: username,
      content: targetDestination,
      ttl: 1,
      proxied: true,
      comment: `${username} alias`
    };

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(webhookPayload),
      });

      const responseText = await webhookResponse.text();
      console.log('Webhook triggered successfully:', {
        status: webhookResponse.status,
        response: responseText,
      });
    } catch (webhookError) {
      console.error('Failed to trigger webhook:', webhookError);
      // We still return success to the user since the DB insert succeeded
      // But log the error for monitoring
    }

    return NextResponse.json({ success: true, message: 'Profile created successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
