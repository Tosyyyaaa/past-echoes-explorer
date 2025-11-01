export type AgnosTurn = { role: "user" | "assistant"; content: string };

export interface AgnosConfig {
  endpoint?: string; // defaults to /api/historian-agent
  voiceId?: string;  // ElevenLabs voice id
}

export class AgnosHistorian {
  private history: AgnosTurn[] = [];
  private eventContext: string = "";
  private title: string = "";
  private endpoint: string;
  private voiceId: string;

  constructor(config?: AgnosConfig) {
    this.endpoint = config?.endpoint || "/api/historian-agent";
    this.voiceId = config?.voiceId || "21m00Tcm4TlvDq8ikWAM";
  }

  setContext(context: { title: string; year?: string; summary?: string }) {
    const { title, year, summary } = context;
    this.title = title;
    this.eventContext = `${title}${year ? ` (${year})` : ""}` + (summary ? `\n${summary}` : "");
  }

  getHistory(): AgnosTurn[] { return this.history.slice(); }

  async ask(question: string): Promise<{ text: string; audioUrl?: string }> {
    const payload = {
      eventContext: this.eventContext,
      userQuestion: question,
      voiceId: this.voiceId,
      history: this.history,
      eventTitle: this.title,
    };
    const resp = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const message = await resp.text().catch(() => `HTTP ${resp.status}`);
      throw new Error(message || 'Historian request failed');
    }
    const data = await resp.json();
    const text: string = data?.text || '';
    const audioUrl: string | undefined = data?.audioUrl;
    // Update dialogue history
    this.history.push({ role: 'user', content: question });
    if (text) this.history.push({ role: 'assistant', content: text });
    return { text, audioUrl };
  }
}


