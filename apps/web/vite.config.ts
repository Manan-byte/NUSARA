import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const geminiApiKey = env.GEMINI_API_KEY || '';
  const geminiModel = env.GEMINI_MODEL || 'gemini-flash-latest';
  const gasApiUrl =
    env.VITE_GAS_API_URL ||
    'https://script.google.com/macros/s/AKfycbw9v-Ihioux0HFuvq_CV-b1OkUSZ53IDUZBPJnE2ej21abxj_pKgSMbiSmPeko9zYmY/exec';

  return {
    plugins: [
      react(),
      {
        name: 'sim-warga-hidden-ai-and-sheets-proxy',
        configureServer(server) {
          // 1. Server-side Proxy untuk Sinkronisasi Langsung Website -> Google Sheets (Tanpa kendala CORS / Opaque Redirect)
          server.middlewares.use('/api/sheets/sync', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const targetUrl = String(parsed.targetGasUrl || gasApiUrl).trim();
                const payload = parsed.payload || parsed;

                const saveDataUriToPublic = (dataUri: string, trxId: string): string => {
                  if (!dataUri || !dataUri.startsWith('data:')) return dataUri;
                  const commaIdx = dataUri.indexOf(',');
                  if (commaIdx === -1) return dataUri;
                  const meta = dataUri.slice(0, commaIdx);
                  const base64Data = dataUri.slice(commaIdx + 1);
                  const isPdf = meta.includes('application/pdf');
                  const ext = isPdf ? 'pdf' : meta.includes('image/png') ? 'png' : 'jpg';
                  const safeTrx = String(trxId || `TRX-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
                  const fileName = `${safeTrx}.${ext}`;
                  const dirPath = path.resolve(__dirname, 'public/bukti-bayar');
                  fs.mkdirSync(dirPath, { recursive: true });
                  fs.writeFileSync(path.join(dirPath, fileName), Buffer.from(base64Data, 'base64'));
                  const publicUrl = `http://localhost:3000/bukti-bayar/${fileName}`;
                  if (isPdf || base64Data.length > 42000) {
                    return publicUrl;
                  }
                  return dataUri;
                };

                if (payload && typeof payload === 'object') {
                  const dataObj = payload.data as Record<string, unknown> | undefined;
                  if (dataObj && typeof dataObj === 'object') {
                    const trxId = String(dataObj.noTransaksi || `TRX-${Date.now()}`);
                    if (typeof dataObj.buktiBayar === 'string' && dataObj.buktiBayar.startsWith('data:')) {
                      dataObj.buktiBayar = saveDataUriToPublic(dataObj.buktiBayar, trxId);
                    }
                    if (typeof dataObj.buktiUrl === 'string' && dataObj.buktiUrl.startsWith('data:')) {
                      dataObj.buktiUrl = saveDataUriToPublic(dataObj.buktiUrl, trxId);
                    }
                  }
                }

                const upstream = await fetch(targetUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                  },
                  body: JSON.stringify(payload),
                  redirect: 'follow',
                });
                const text = await upstream.text();
                res.statusCode = upstream.ok ? 200 : upstream.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(text);
              } catch (err) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: String(err) }));
              }
            });
          });

          // 2. Server-side Proxy untuk AI (Menyembunyikan GEMINI_API_KEY 100% di Server)
          server.middlewares.use('/api/ai/generate', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }
            if (!geminiApiKey) {
              res.statusCode = 503;
              res.end(JSON.stringify({ error: 'AI key not configured on server' }));
              return;
            }
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const prompt = String(parsed.prompt || '').trim();
                const upstream = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-goog-api-key': geminiApiKey,
                    },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }] }],
                    }),
                  }
                );
                const data = await upstream.json();
                res.statusCode = upstream.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Upstream AI request failed' }));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@sim-warga/types': path.resolve(__dirname, '../../packages/types/src'),
        '@sim-warga/ui': path.resolve(__dirname, '../../packages/ui/src'),
      },
    },
    server: {
      port: 3000,
      open: false,
    },
  };
});
