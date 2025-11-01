import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { Readable } from "node:stream";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files and hydrate process.env for server-side usage
  const env = loadEnv(mode, process.cwd(), "");
  if (env.ELEVENLABS_API_KEY && !process.env.ELEVENLABS_API_KEY) {
    process.env.ELEVENLABS_API_KEY = env.ELEVENLABS_API_KEY;
  }
  if (env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }
  // Reusable middleware to proxy ElevenLabs TTS
  const ttsMiddleware = () => async (req: any, res: any) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    try {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        res.statusCode = 500;
        res.end("Missing ELEVENLABS_API_KEY env var");
        return;
      }

      // read JSON body
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve) => {
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => resolve());
      });
      const raw = Buffer.concat(chunks).toString("utf8");
      let parsed: any = {};
      try { parsed = raw ? JSON.parse(raw) : {}; } catch {
        res.statusCode = 400;
        res.end("Invalid JSON body");
        return;
      }

      const text: string | undefined = parsed?.text;
      const voiceId: string | undefined = parsed?.voice_id;
      if (!text || !voiceId) {
        res.statusCode = 400;
        res.end("'text' and 'voice_id' are required");
        return;
      }

      // Use non-stream endpoint for broader compatibility
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      const upstream = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          output_format: "mp3_44100_128",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });

      if (!upstream.ok) {
        let message = "Upstream error";
        try {
          message = await upstream.text();
        } catch {}
        res.statusCode = upstream.status || 502;
        res.end(message || "Failed to fetch TTS audio");
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "no-store");
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.end(buf);
    } catch (err: any) {
      res.statusCode = 500;
      res.end("TTS proxy error");
    }
  };

  const historianAgentMiddleware = () => async (req: any, res: any) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }
    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      const xiKey = process.env.ELEVENLABS_API_KEY;
      if (!openaiKey) {
        res.statusCode = 500;
        res.end("Missing OPENAI_API_KEY env var");
        return;
      }
      if (!xiKey) {
        res.statusCode = 500;
        res.end("Missing ELEVENLABS_API_KEY env var");
        return;
      }

      const chunks: Buffer[] = [];
      await new Promise<void>((resolve) => {
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => resolve());
      });
      const raw = Buffer.concat(chunks).toString("utf8");
      let parsed: any = {};
      try { parsed = raw ? JSON.parse(raw) : {}; } catch {
        res.statusCode = 400;
        res.end("Invalid JSON body");
        return;
      }
      const eventContext: string = parsed?.eventContext || "";
      const userQuestion: string = parsed?.userQuestion || "";
      const history: Array<{ role: "user" | "assistant"; content: string }>
        = Array.isArray(parsed?.history) ? parsed.history : [];
      const voiceId: string = parsed?.voiceId || "21m00Tcm4TlvDq8ikWAM"; // default Historian
      if (!userQuestion) {
        res.statusCode = 400;
        res.end("'userQuestion' is required");
        return;
      }

      const systemPrompt = "You are the PastPort Historian — an AI guide who explains historical events conversationally. Speak like a calm museum guide with a story-driven tone that matches a museum audio guide. Keep responses concise and factual, referencing causes, outcomes, and echoes in history where helpful.";

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        { role: "system", content: `Context for this chat:\n${eventContext}` },
        ...history.slice(-6),
        { role: "user", content: userQuestion },
      ];

      const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          temperature: 0.7,
        }),
      });
      if (!aiResp.ok) {
        const message = await aiResp.text().catch(() => "OpenAI error");
        res.statusCode = aiResp.status || 502;
        res.end(message);
        return;
      }
      const aiJson: any = await aiResp.json();
      const text: string = aiJson?.choices?.[0]?.message?.content || "";

      let audioUrl = "";
      try {
        const xiResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "xi-api-key": xiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({ text, model_id: "eleven_turbo_v2", output_format: "mp3_44100_128" }),
        });
        if (xiResp.ok) {
          const buf = Buffer.from(await xiResp.arrayBuffer());
          audioUrl = `data:audio/mpeg;base64,${buf.toString("base64")}`;
        }
      } catch {}

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ text, audioUrl }));
    } catch {
      res.statusCode = 500;
      res.end("Historian agent error");
    }
  };

  return {
    server: {
      host: "::",
      port: 8080,
      // dev server middleware
      middlewareMode: false,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      {
        name: "tts-proxy",
        configureServer(server) {
          server.middlewares.use("/api/tts", ttsMiddleware());
          server.middlewares.use("/api/historian-agent", historianAgentMiddleware());
        },
        configurePreviewServer(server) {
          server.middlewares.use("/api/tts", ttsMiddleware());
          server.middlewares.use("/api/historian-agent", historianAgentMiddleware());
        },
      },
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    preview: {
      port: 8080,
      host: "::",
    },
  };
});
