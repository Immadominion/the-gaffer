"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowUp, Brain, SealCheck } from "@/components/icons";
import { useTRPC } from "@/lib/trpc";
import { useGameData } from "@/lib/useGameData";

/* eslint-disable @next/next/no-img-element */

type Msg = { from: "me" | "gaffer"; text: string };

export default function GafferChatPage() {
  const trpc = useTRPC();
  const g = useGameData();
  const me = g.me;
  const d = g.meRaw;
  const chatM = useMutation(trpc.chat.mutationOptions());
  const historyQ = useQuery(trpc.chatHistory.queryOptions({ limit: 50 }));
  const seeded = useRef(false);

  const [messages, setMessages] = useState<Msg[]>([
    { from: "gaffer", text: "Back again. What's the next call — and don't give me the safe one." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatM.isPending]);

  // Seed the conversation from the persisted transcript, once.
  useEffect(() => {
    if (seeded.current || !historyQ.data) return;
    seeded.current = true;
    if (historyQ.data.length > 0) {
      setMessages(
        historyQ.data.flatMap((e) => [
          { from: "me" as const, text: e.message },
          { from: "gaffer" as const, text: e.reply },
        ]),
      );
    }
  }, [historyQ.data]);

  const send = async () => {
    const text = input.trim();
    if (!text || chatM.isPending) return;
    setInput("");
    setMessages((m) => [...m, { from: "me", text }]);
    try {
      const reply = await chatM.mutateAsync({ message: text });
      setMessages((m) => [...m, { from: "gaffer", text: reply }]);
    } catch {
      setMessages((m) => [...m, { from: "gaffer", text: "Can't get to you right now — give me a second and try again." }]);
    }
  };

  const read = d?.lastVerdict?.text ?? "Loyal to a fault. Make a few calls and I'll have your number soon enough.";

  return (
    <div className="chatwrap">
      {/* CONVERSATION */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", borderRight: "1px solid #E7ECE3" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "20px 28px", borderBottom: "1px solid #E7ECE3" }}>
          <img src="/img/gaffer.png" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", objectPosition: "50% 16%", background: "#1a2b22", boxShadow: "0 0 0 2px #fff" }} alt="The Gaffer" />
          <div style={{ flex: 1 }}>
            <div className="cd" style={{ fontSize: 17 }}>The Gaffer</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0BA14A", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0BA14A", display: "inline-block" }} />
              {chatM.isPending ? "thinking…" : "reading your dossier"}
            </div>
          </div>
          <SealCheck size={22} weight="fill" color="#0BA14A" />
        </div>

        <div ref={scrollRef} className="scroll-soft" style={{ flex: 1, overflow: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14, background: "#F7FAF6" }}>
          <div style={{ alignSelf: "center", fontSize: 10.5, fontWeight: 700, letterSpacing: ".6px", color: "#A6B2A9", background: "#E7EBE3", padding: "4px 12px", borderRadius: 20 }}>
            TODAY
          </div>
          {messages.map((m, i) =>
            m.from === "gaffer" ? (
              <div key={i} style={{ maxWidth: "62%", alignSelf: "flex-start", background: "#0E1A14", color: "#EAF3ED", borderRadius: "18px 18px 18px 5px", padding: "13px 16px", fontSize: 14, lineHeight: 1.45, fontWeight: 500 }}>
                {m.text}
              </div>
            ) : (
              <div key={i} style={{ maxWidth: "58%", alignSelf: "flex-end", background: "#fff", borderRadius: "18px 18px 5px 18px", padding: "13px 16px", fontSize: 14, lineHeight: 1.45, fontWeight: 500, boxShadow: "0 2px 8px rgba(16,35,26,.06)" }}>
                {m.text}
              </div>
            ),
          )}
          {chatM.isPending && (
            <div style={{ maxWidth: "62%", alignSelf: "flex-start", background: "#0E1A14", color: "#8FE7B0", borderRadius: "18px 18px 18px 5px", padding: "13px 16px", fontSize: 14, fontWeight: 600 }}>
              …
            </div>
          )}
        </div>

        <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #E7ECE3" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void send(); }}
            placeholder="Tell him your next call…"
            style={{ flex: 1, background: "#F3F6F1", borderRadius: 24, padding: "13px 18px", fontSize: 14, color: "#10231A", fontWeight: 500, border: "none", outline: "none", fontFamily: "var(--font-sans)" }}
          />
          <button
            onClick={() => void send()}
            disabled={chatM.isPending || !input.trim()}
            style={{ width: 46, height: 46, borderRadius: "50%", border: "none", background: "linear-gradient(135deg,#14B85A,#0A8A41)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 16px rgba(11,138,60,.3)", opacity: chatM.isPending || !input.trim() ? 0.6 : 1 }}
          >
            <ArrowUp size={19} weight="fill" color="#fff" />
          </button>
        </div>
      </div>

      {/* CONTEXT */}
      <div className="chatctx" style={{ width: 300, flex: "none", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="cd" style={{ fontSize: 16 }}>On the record</div>
        <div className="ink" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/img/gaffer.png" style={{ width: 40, height: 40, borderRadius: 11, objectFit: "cover", objectPosition: "50% 16%", background: "#1a2b22" }} alt="" />
            <div>
              <div className="cd" style={{ fontSize: 11, letterSpacing: "1px", color: "#8FE7B0" }}>HIS READ ON YOU</div>
            </div>
          </div>
          <p style={{ margin: "11px 0 0", fontSize: 13, lineHeight: 1.45, color: "#EAF3ED", fontWeight: 500 }}>
            &ldquo;{read}&rdquo;
          </p>
        </div>
        {[
          { l: "Hit rate", v: `${me?.hitRate ?? 0}%`, c: "#0A7E40" },
          { l: "Calls made", v: `${me?.calls ?? 0}`, c: "#10231A" },
          { l: "Open stake", v: `${(me?.staked ?? 0).toFixed(1)} WAL`, c: "#10231A", mono: true },
        ].map((r) => (
          <div key={r.l} className="card" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6E7C72" }}>{r.l}</span>
            <span className={r.mono ? "mono" : undefined} style={{ fontSize: 12, fontWeight: 700, color: r.c }}>{r.v}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#A6B2A9", fontWeight: 600, marginTop: 2 }}>
          <Brain size={14} weight="fill" color="#0BA14A" />
          Every word is remembered on Walrus.
        </div>
      </div>
    </div>
  );
}
