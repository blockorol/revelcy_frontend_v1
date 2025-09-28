export const runtime = 'nodejs';
const TARGET = 'https://pump.fun/api/ipfs';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const upstream = await fetch(TARGET, { method: 'POST', body: form });

    const text = await upstream.text();
    let body: any = text;
    try { body = JSON.parse(text); } catch {}

    return new Response(
      typeof body === 'string' ? body : JSON.stringify(body),
      {
        status: upstream.status,
        headers: {
          'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json',
          ...corsHeaders(),
        },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'proxy failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
}
