/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Copy, Check, RotateCcw, Shuffle, Navigation, Volume2, Sliders, AudioWaveform, Timer, GitBranch, Plus, Pencil, Trash2 } from 'lucide-react';
import { DIMS, ORDER } from '../data/chunkMapData.ts';
import { DimensionKey, LinkItem, NodeItem, StudyLanguage } from '../types.ts';
import { useStudyStore } from '../context/StudyStoreContext.tsx';
import { playSpeech } from '../utils/speech.ts';
import SlotCustomizerModal from './SlotCustomizerModal.tsx';
import ConnectedSpeechModal from './ConnectedSpeechModal.tsx';
import ChunkEditorModal from './ChunkEditorModal.tsx';
import NewBranchModal from './NewBranchModal.tsx';

interface ChunkMapProps {
  language?: StudyLanguage;
  onPracticeRhythm?: (phrase: string) => void;
}

export default function ChunkMap({ language = 'en', onPracticeRhythm }: ChunkMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { chunkData: activeData, isDefaultPhrase, deleteCustomPhrase } = useStudyStore();

  // Selection state
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [customizerPhrase, setCustomizerPhrase] = useState<string | null>(null);
  const [speechModalPhrase, setSpeechModalPhrase] = useState<string | null>(null);
  const [editingChunk, setEditingChunk] = useState<{
    dim: DimensionKey;
    branchName: string;
    chunk: string;
  } | null>(null);
  const [newBranchModal, setNewBranchModal] = useState<{
    open: boolean;
    initialDim?: DimensionKey;
    initialBranch?: string;
  }>({ open: false });

  // Simulation references (kept in refs so render loop stays 60fps)
  const simRef = useRef<{
    nodes: NodeItem[];
    links: LinkItem[];
    center: NodeItem;
    cam: { x: number; y: number; k: number };
    first: boolean;
    drag: NodeItem | null;
    pan: { sx: number; sy: number; cx: number; cy: number } | null;
    hover: NodeItem | null;
    moved: number;
    w: number;
    h: number;
    dpr: number;
    animId: number;
  }>({
    nodes: [],
    links: [],
    center: { label: "chunks", type: "center", dim: 5, x: 0, y: 0, vx: 0, vy: 0 },
    cam: { x: 0, y: 0, k: 1 },
    first: true,
    drag: null,
    pan: null,
    hover: null,
    moved: 0,
    w: 0,
    h: 0,
    dpr: 1,
    animId: 0
  });

  const selectedRef = useRef<Record<string, string>>({});
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Reset selection when language changes
  useEffect(() => {
    setSelected({});
  }, [language]);

  // Build the graph on mount or when language changes
  useEffect(() => {
    const nodes: NodeItem[] = [];
    const links: LinkItem[] = [];
    const ln = (a: NodeItem, b: NodeItem, len: number) => links.push({ a, b, len });
    const mk = (o: Partial<NodeItem> & { label: string; type: NodeItem['type']; dim: number }, x: number, y: number): NodeItem => {
      const item: NodeItem = {
        label: o.label,
        type: o.type,
        dim: o.dim,
        hub: o.hub,
        pk: o.pk,
        x,
        y,
        vx: 0,
        vy: 0
      };
      nodes.push(item);
      return item;
    };

    const center = mk({ label: "chunks", type: "center", dim: 5 }, 0, 0);

    DIMS.forEach((d, i) => {
      const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const hx = Math.cos(ang) * 190;
      const hy = Math.sin(ang) * 190;
      const hub = mk({ label: d, type: "hub", dim: i }, hx, hy);
      ln(center, hub, 190);

      const keys = Object.keys(activeData[d]);
      keys.forEach((k, j) => {
        const a = ang + (j - (keys.length - 1) / 2) * 0.55;
        const it = mk({ label: k, type: "item", dim: i, hub }, hx + Math.cos(a) * 90, hy + Math.sin(a) * 90);
        ln(hub, it, 80);

        activeData[d][k].forEach(t => {
          const c = mk({ label: t, type: "chunk", dim: i, pk: it }, it.x, it.y);
          ln(it, c, 50);
        });
      });
    });

    simRef.current.nodes = nodes;
    simRef.current.links = links;
    simRef.current.center = center;

    // Warm up layout
    for (let i = 0; i < 260; i++) {
      tickPhysics(nodes, links, center, null, {});
    }
  }, [activeData, language]);

  const copyToClipboard = useCallback((text: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2200);
    } catch {
      // ignore
    }
  }, []);

  // Physics simulation step
  function tickPhysics(
    nodes: NodeItem[],
    links: LinkItem[],
    center: NodeItem,
    dragNode: NodeItem | null,
    curSel: Record<string, string>
  ) {
    const isVisible = (n: NodeItem) => n.type !== "chunk" || (n.pk && curSel[DIMS[n.dim]] === n.pk.label);
    const visibleNodes = nodes.filter(isVisible);

    for (let i = 0; i < visibleNodes.length; i++) {
      for (let j = i + 1; j < visibleNodes.length; j++) {
        const a = visibleNodes[i];
        const b = visibleNodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        const d = Math.hypot(dx, dy) || 0.1;
        if (d > 320) continue;
        const K = a.type === "chunk" || b.type === "chunk" ? 120 : 260;
        const f = K / d;
        dx /= d;
        dy /= d;
        a.vx += dx * f;
        a.vy += dy * f;
        b.vx -= dx * f;
        b.vy -= dy * f;
      }
    }

    links.forEach(l => {
      if (!isVisible(l.a) || !isVisible(l.b)) return;
      const dx = l.b.x - l.a.x;
      const dy = l.b.y - l.a.y;
      const d = Math.hypot(dx, dy) || 0.1;
      const f = (d - l.len) * 0.06;
      l.a.vx += (dx / d) * f;
      l.a.vy += (dy / d) * f;
      l.b.vx -= (dx / d) * f;
      l.b.vy -= (dy / d) * f;
    });

    visibleNodes.forEach(n => {
      n.vx -= n.x * 0.003;
      n.vy -= n.y * 0.003;
      n.vx *= 0.75;
      n.vy *= 0.75;
      if (n !== dragNode && n !== center) {
        n.x += n.vx;
        n.y += n.vy;
      }
    });
  }

  // Canvas loop & resize observer
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const R = { center: 9, hub: 8, item: 5.5, chunk: 3.5 };

    const fit = () => {
      const rect = cv.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;
      const dpr = window.devicePixelRatio || 1;
      simRef.current.w = w;
      simRef.current.h = h;
      simRef.current.dpr = dpr;
      cv.width = w * dpr;
      cv.height = h * dpr;

      if (simRef.current.first) {
        simRef.current.cam.k = Math.min(w, h) / 640;
        simRef.current.cam.x = w / 2;
        simRef.current.cam.y = h / 2;
        simRef.current.first = false;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(cv);

    let active = true;

    const render = () => {
      if (!active) return;
      const { nodes, links, center, cam, dpr, w, h, hover, drag } = simRef.current;
      const curSel = selectedRef.current;

      tickPhysics(nodes, links, center, drag, curSel);

      const isVisible = (n: NodeItem) => n.type !== "chunk" || (n.pk && curSel[DIMS[n.dim]] === n.pk.label);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.setTransform(dpr * cam.k, 0, 0, dpr * cam.k, dpr * cam.x, dpr * cam.y);

      const nb = new Set<NodeItem>();
      if (hover) {
        nb.add(hover);
        links.forEach(l => {
          if (l.a === hover) nb.add(l.b);
          if (l.b === hover) nb.add(l.a);
        });
      }

      const cs = getComputedStyle(document.documentElement);
      const getVar = (name: string) => cs.getPropertyValue(name).trim() || '#888';
      const isDark = document.documentElement.classList.contains('dark');
      const inkCol = getVar("--ink");
      const muteCol = getVar("--mute");
      const bgCol = getVar("--bg");

      const vibrantPalette = isDark
        ? ["#ff7b29", "#a855f7", "#22d3ee", "#34d399", "#f43f8e", "#cbd5e1"]
        : ["#f97316", "#7c3aed", "#0891b2", "#16a34a", "#e11d48", "#475569"];
      const grayCol = isDark ? "#52525b" : "#9ca3af";
      const grayLinkCol = isDark ? "#3f3f46" : "#cbd5e1";

      const activeSelectionDims = DIMS.filter(d => curSel[d] !== undefined);
      const hasSelection = activeSelectionDims.length > 0;
      const hasFocus = Boolean(hover) || hasSelection;

      const isNodeFocused = (n: NodeItem): boolean => {
        if (!hasFocus) return true;
        if (hover) {
          return nb.has(n);
        }
        // Selection-based focus
        if (n.type === "center") return true;
        const dimKey = DIMS[n.dim];
        if (!dimKey) return false;
        if (n.type === "hub") return curSel[dimKey] !== undefined;
        if (n.type === "item") return curSel[dimKey] === n.label;
        if (n.type === "chunk") return Boolean(n.pk && curSel[dimKey] === n.pk.label);
        return false;
      };

      const isLinkFocused = (l: LinkItem): boolean => {
        if (!hasFocus) return true;
        if (hover) {
          return l.a === hover || l.b === hover;
        }
        return isNodeFocused(l.a) && isNodeFocused(l.b);
      };

      // Draw links
      links.forEach(l => {
        if (!isVisible(l.a) || !isVisible(l.b)) return;
        const focused = isLinkFocused(l);
        ctx.lineWidth = (focused && hasFocus ? 1.8 : 1) / cam.k;
        ctx.globalAlpha = hasFocus ? (focused ? 0.92 : 0.2) : 0.78;
        ctx.strokeStyle = focused
          ? (hasFocus ? (vibrantPalette[l.b.dim] || getVar(`--c${l.b.dim}`)) : getVar("--line"))
          : grayLinkCol;
        ctx.beginPath();
        ctx.moveTo(l.a.x, l.a.y);
        ctx.lineTo(l.b.x, l.b.y);
        ctx.stroke();
      });

      ctx.globalAlpha = 1;

      // Draw path between picked items in ORDER
      const picks = ORDER
        .slice()
        .sort((a, b) => a - b)
        .filter(i => curSel[DIMS[i]] !== undefined)
        .map(i => nodes.find(n => n.type === "item" && n.dim === i && n.label === curSel[DIMS[i]]))
        .filter((n): n is NodeItem => Boolean(n));

      ctx.setLineDash([6 / cam.k, 5 / cam.k]);
      ctx.lineWidth = 2.6 / cam.k;
      for (let i = 0; i < picks.length - 1; i++) {
        const focused = !hover || (nb.has(picks[i]) && nb.has(picks[i + 1]));
        ctx.globalAlpha = focused ? 0.95 : 0.25;
        ctx.strokeStyle = focused ? (vibrantPalette[picks[i + 1].dim] || getVar(`--c${picks[i + 1].dim}`)) : grayLinkCol;
        ctx.beginPath();
        ctx.moveTo(picks[i].x, picks[i].y);
        ctx.lineTo(picks[i + 1].x, picks[i + 1].y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.textAlign = "center";

      // Draw nodes
      nodes.forEach(n => {
        if (!isVisible(n)) return;
        const on = n.type === "item" && curSel[DIMS[n.dim]] === n.label;
        const focused = isNodeFocused(n);
        const dimColor = vibrantPalette[n.dim] || getVar(`--c${n.dim}`);
        const col = focused ? dimColor : grayCol;
        const r = R[n.type] + (on ? 2.2 : focused && hasFocus ? 1.2 : 0);

        ctx.globalAlpha = hasFocus ? (focused ? 1 : 0.28) : 1;

        // Subtle vibrant halo for focused nodes when focus mode is active
        if (hasFocus && focused && (on || n === hover || n.type === "chunk" || n.type === "hub")) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 4.5 / cam.k, 0, Math.PI * 2);
          ctx.fillStyle = dimColor;
          ctx.globalAlpha = n === hover || on ? 0.24 : 0.14;
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = 1;
        }

        ctx.save();
        if (hasFocus && focused && (n === hover || on)) {
          ctx.shadowColor = dimColor;
          ctx.shadowBlur = 10;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n.type === "item" && !on ? bgCol : col;
        ctx.fill();

        if (n.type === "item" || on || (hasFocus && focused)) {
          ctx.strokeStyle = col;
          ctx.lineWidth = (on || n === hover ? 2.6 : 1.6) / cam.k;
          ctx.stroke();
        }
        ctx.restore();

        const s = (n.type === "hub" || n.type === "center" ? 13 : n.type === "item" ? 11.5 : 10.5) / cam.k;
        ctx.font = `${n.type === "hub" || (hasFocus && focused && (on || n === hover)) ? "600 " : ""}${s}px system-ui, -apple-system, sans-serif`;
        if (!focused) {
          ctx.fillStyle = grayCol;
        } else if (n.type === "chunk") {
          ctx.fillStyle = hasFocus ? inkCol : muteCol;
        } else {
          ctx.fillStyle = inkCol;
        }
        const t = n.type === "chunk" && n.label.length > 30 ? n.label.slice(0, 29) + "…" : n.label;
        ctx.fillText(t, n.x, n.y + r + 12 / cam.k);
      });

      ctx.globalAlpha = 1;
      simRef.current.animId = requestAnimationFrame(render);
    };

    simRef.current.animId = requestAnimationFrame(render);

    return () => {
      active = false;
      observer.disconnect();
      cancelAnimationFrame(simRef.current.animId);
    };
  }, []);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.setPointerCapture(e.pointerId);
    const rect = cv.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    simRef.current.moved = 0;

    const hit = findHitNode(sx, sy);
    if (hit) {
      simRef.current.drag = hit;
    } else {
      simRef.current.pan = {
        sx,
        sy,
        cx: simRef.current.cam.x,
        cy: simRef.current.cam.y
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const { drag, pan, cam } = simRef.current;

    if (drag) {
      simRef.current.moved++;
      drag.x = (sx - cam.x) / cam.k;
      drag.y = (sy - cam.y) / cam.k;
      drag.vx = 0;
      drag.vy = 0;
    } else if (pan) {
      simRef.current.moved++;
      cam.x = pan.cx + sx - pan.sx;
      cam.y = pan.cy + sy - pan.sy;
    } else {
      const hover = findHitNode(sx, sy);
      simRef.current.hover = hover;
      cv.style.cursor = hover ? "pointer" : "default";
    }
  };

  const handlePointerUp = () => {
    const { drag, moved } = simRef.current;
    if (drag && moved < 4) {
      handleNodeClick(drag);
    }
    simRef.current.drag = null;
    simRef.current.pan = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { cam } = simRef.current;

    const k = Math.min(3, Math.max(0.3, cam.k * (e.deltaY < 0 ? 1.1 : 0.9)));
    cam.x = sx - ((sx - cam.x) * k) / cam.k;
    cam.y = sy - ((sy - cam.y) * k) / cam.k;
    cam.k = k;
  };

  const findHitNode = (sx: number, sy: number): NodeItem | null => {
    const { cam, nodes } = simRef.current;
    const curSel = selectedRef.current;
    const isVisible = (n: NodeItem) => n.type !== "chunk" || (n.pk && curSel[DIMS[n.dim]] === n.pk.label);
    const x = (sx - cam.x) / cam.k;
    const y = (sy - cam.y) / cam.k;
    const R: Record<string, number> = { center: 9, hub: 8, item: 5.5, chunk: 3.5 };

    let best: NodeItem | null = null;
    let bestDist = 1e9;

    nodes.forEach(n => {
      if (!isVisible(n)) return;
      const d = Math.hypot(n.x - x, n.y - y);
      const threshold = Math.max((R[n.type] || 6) + 6, 12 / cam.k);
      if (d < threshold && d < bestDist) {
        best = n;
        bestDist = d;
      }
    });

    return best;
  };

  const handleNodeClick = (n: NodeItem) => {
    const d = DIMS[n.dim];
    if (!d) return;

    if (n.type === "item") {
      setSelected(prev => {
        const next = { ...prev };
        if (next[d] === n.label) {
          delete next[d];
        } else {
          next[d] = n.label;
          // disperse child chunks slightly
          simRef.current.nodes.forEach(c => {
            if (c.type === "chunk" && c.pk === n) {
              c.x = n.x + (Math.random() - 0.5) * 20;
              c.y = n.y + (Math.random() - 0.5) * 20;
            }
          });
        }
        return next;
      });
    } else if (n.type === "hub") {
      setSelected(prev => {
        const next = { ...prev };
        delete next[d];
        return next;
      });
    } else if (n.type === "chunk") {
      setEditingChunk({
        dim: d,
        branchName: n.pk?.label || Object.keys(activeData[d] || {})[0] || '',
        chunk: n.label
      });
    }
  };

  const handleClear = () => {
    setSelected({});
  };

  const handleRandom = () => {
    const newSel: Record<string, string> = {};
    DIMS.forEach(d => {
      const keys = Object.keys(activeData[d]);
      newSel[d] = keys[Math.floor(Math.random() * keys.length)];
    });
    setSelected(newSel);

    simRef.current.nodes.forEach(c => {
      if (c.type === "chunk" && c.pk && newSel[DIMS[c.dim]] === c.pk.label) {
        c.x = c.pk.x;
        c.y = c.pk.y;
      }
    });
  };

  // Derive sidebar outputs
  const anySelected = DIMS.some(d => selected[d] !== undefined && activeData[d]?.[selected[d]] !== undefined);
  const vectorStr = `vetor = (${DIMS.map(d => (selected[d] === undefined || !activeData[d]?.[selected[d]] ? 0 : Object.keys(activeData[d]).indexOf(selected[d]) + 1)).join(", ")})`;

  const sentenceParts = ORDER
    .filter(i => selected[DIMS[i]] !== undefined && Boolean(activeData[DIMS[i]]?.[selected[DIMS[i]]]?.[0]))
    .map(i => activeData[DIMS[i]][selected[DIMS[i]]][0]);
  const sentenceOutline = sentenceParts.join(" ");

  const handlePlayAudio = (phrase: string) => {
    setPlayingAudio(phrase);
    playSpeech(phrase, language, 0.95, () => setPlayingAudio(null));
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      {/* Visual Canvas Area */}
      <div ref={containerRef} className="flex-1 relative min-w-0 h-[55vh] md:h-full bg-[var(--bg)]">
        {/* Floating Top Control Pill inside canvas */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 bg-[var(--panel)]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[var(--line)] shadow-xs">
          <button
            onClick={handleRandom}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-[var(--line)] hover:border-[var(--c1)] hover:text-[var(--c1)] transition-colors"
            title="Escolher caminho aleatório"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Aleatório</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-[var(--line)] hover:border-red-500 hover:text-red-500 transition-colors"
            title="Limpar seleção"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
          <button
            onClick={() => setNewBranchModal({ open: true })}
            className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-2xs"
            title="Criar nova ramificação ou nó no grafo"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Nova Ramificação</span>
          </button>
        </div>

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className="absolute inset-0 w-full h-full block touch-none"
        />

        <div className="absolute left-3 bottom-2 text-xs text-[var(--mute)] pointer-events-none select-none flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-[var(--c2)]" />
          <span>Clique em uma ramificação ou direto em um chunk para incluir palavras e treinar no Rhythm Lab.</span>
        </div>
      </div>

      {/* Right / Bottom Sidebar */}
      <aside className="w-full md:w-[360px] h-[45vh] md:h-full overflow-y-auto bg-[var(--panel)] border-t md:border-t-0 md:border-l border-[var(--line)] p-4 flex flex-col gap-4">
        {/* Section: Caminho */}
        <div>
          <h2 className="text-xs uppercase font-semibold text-[var(--mute)] tracking-wider mb-2">
            Caminho Selecionado
          </h2>
          <div className="text-sm font-medium leading-relaxed flex flex-wrap gap-1.5 items-center">
            {DIMS.map((d, i) => {
              const val = selected[d];
              if (val && activeData[d]?.[val]) {
                return (
                  <span
                    key={d}
                    style={{ color: `var(--c${i})` }}
                    className="font-semibold"
                  >
                    [{val}]
                  </span>
                );
              }
              return (
                <span key={d} className="text-[var(--mute)] opacity-60">
                  [ {d} ]
                </span>
              );
            })}
          </div>
          <div className="text-xs text-[var(--mute)] mt-1 font-mono tabular-nums">
            {vectorStr}
          </div>
        </div>

        {/* Section: Esboço da Frase */}
        <div className="border border-dashed border-[var(--line)] rounded-lg p-3 bg-[var(--bg)]/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase font-semibold text-[var(--mute)] tracking-wider">
              Esboço da Frase
            </h2>
            {anySelected && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePlayAudio(sentenceOutline)}
                  title="Ouvir pronúncia"
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border border-[var(--line)] hover:border-[var(--c1)] hover:text-[var(--c1)] transition-colors"
                >
                  <Volume2 className={`w-3 h-3 ${playingAudio === sentenceOutline ? 'animate-pulse text-[var(--c1)]' : ''}`} />
                  <span>Ouvir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechModalPhrase(sentenceOutline)}
                  title="Analisar fala conectada e pronúncia nativa"
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border border-[var(--line)] hover:border-amber-500 hover:text-amber-500 transition-colors"
                >
                  <AudioWaveform className="w-3 h-3 text-amber-500" />
                  <span className="hidden sm:inline">Fala Nativa</span>
                </button>
                {onPracticeRhythm && (
                  <button
                    type="button"
                    onClick={() => onPracticeRhythm(sentenceOutline)}
                    title="Treinar ritmo e stress no metrônomo"
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border border-[var(--line)] hover:border-rose-500 hover:text-rose-500 transition-colors"
                  >
                    <Timer className="w-3 h-3 text-rose-500" />
                    <span className="hidden sm:inline">Ritmo</span>
                  </button>
                )}
                <button
                  onClick={() => copyToClipboard(sentenceOutline)}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border border-[var(--line)] hover:border-[var(--c1)] hover:text-[var(--c1)] transition-colors"
                >
                  {copiedText === sentenceOutline ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          <div className="text-sm leading-relaxed text-[var(--ink)]">
            {anySelected ? (
              <p className="italic font-serif text-[15px]">{sentenceOutline}</p>
            ) : (
              <span className="text-xs text-[var(--mute)]">
                Escolha ao menos um ponto no grafo para compor a frase.
              </span>
            )}
          </div>
        </div>

        {/* Section: Chunks do Caminho */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs uppercase font-semibold text-[var(--mute)] tracking-wider">
              Chunks do Caminho
            </h2>
            <button
              type="button"
              onClick={() => {
                const firstSelDim = DIMS.find(d => selected[d] !== undefined);
                setNewBranchModal({
                  open: true,
                  initialDim: firstSelDim || 'lugar',
                  initialBranch: firstSelDim ? selected[firstSelDim] : ''
                });
              }}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Novo chunk / ramo</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {anySelected ? (
              DIMS.filter(d => selected[d] !== undefined && activeData[d]?.[selected[d]]).map(d => {
                const dimIndex = DIMS.indexOf(d);
                const branchName = selected[d];
                const chunks = activeData[d]?.[branchName] || [];
                return chunks.map(chunk => {
                  const isCopied = copiedText === chunk;
                  const isPlaying = playingAudio === chunk;
                  const hasSlots = chunk.includes('[');
                  const customPhrase = !isDefaultPhrase(d, branchName, chunk);

                  return (
                    <div
                      key={`${d}-${branchName}-${chunk}`}
                      style={{ borderLeftColor: `var(--c${dimIndex})` }}
                      className="w-full text-left p-2 rounded-r-md bg-[var(--bg)]/40 hover:bg-[var(--bg)] border-l-3 text-xs leading-relaxed text-[var(--ink)] transition-colors group flex items-start justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => setEditingChunk({ dim: d, branchName, chunk })}
                        title="Clique para incluir palavras neste chunk ou enviar ao Rhythm Lab"
                        className="flex-1 text-left hover:text-[var(--c1)] transition-colors cursor-pointer"
                      >
                        {chunk}
                      </button>
                      <div className="flex items-center gap-0.5 shrink-0 opacity-85 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setEditingChunk({ dim: d, branchName, chunk })}
                          title="Incluir novas palavras neste chunk"
                          className="p-1 rounded hover:bg-[var(--line)]/30 text-[var(--mute)] hover:text-emerald-500"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePlayAudio(chunk)}
                          title="Ouvir pronúncia"
                          className="p-1 rounded hover:bg-[var(--line)]/30 text-[var(--mute)] hover:text-[var(--c1)]"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse text-[var(--c1)]' : ''}`} />
                        </button>

                        {hasSlots && (
                          <button
                            type="button"
                            onClick={() => setCustomizerPhrase(chunk)}
                            title="Personalizar slots desta frase"
                            className="p-1 rounded hover:bg-[var(--line)]/30 text-[var(--mute)] hover:text-[var(--c1)]"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSpeechModalPhrase(chunk)}
                          title="Analisar fala conectada e reduções fonéticas"
                          className="p-1 rounded hover:bg-[var(--line)]/30 text-[var(--mute)] hover:text-amber-500"
                        >
                          <AudioWaveform className="w-3.5 h-3.5" />
                        </button>

                        {onPracticeRhythm && (
                          <button
                            type="button"
                            onClick={() => onPracticeRhythm(chunk)}
                            title="Enviar para o Rhythm Lab"
                            className="p-1 rounded hover:bg-[var(--line)]/30 text-[var(--mute)] hover:text-rose-500"
                          >
                            <Timer className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => copyToClipboard(chunk)}
                          title="Copiar chunk"
                          className="p-1 rounded hover:bg-[var(--line)]/30 text-[var(--mute)] hover:text-[var(--ink)]"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {customPhrase && (
                          <button
                            type="button"
                            onClick={() => deleteCustomPhrase(d, branchName, chunk)}
                            title="Remover frase personalizada"
                            className="p-1 rounded hover:bg-[var(--line)]/30 text-[var(--mute)] hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })
            ) : (
              <div className="text-xs text-[var(--mute)] p-3 text-center border border-[var(--line)] rounded-lg">
                Os chunks de cada ponto escolhido aparecem aqui. Clique em qualquer chunk para incluir palavras!
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Slot Customizer Modal */}
      {customizerPhrase && (
        <SlotCustomizerModal
          initialPhrase={customizerPhrase}
          language={language}
          onClose={() => setCustomizerPhrase(null)}
          onPracticeRhythm={onPracticeRhythm}
        />
      )}

      {/* Connected Speech Breakdown Modal */}
      {speechModalPhrase && (
        <ConnectedSpeechModal
          phrase={speechModalPhrase}
          language={language}
          onClose={() => setSpeechModalPhrase(null)}
        />
      )}

      {/* Chunk Word Editor Modal (on clicking a chunk) */}
      {editingChunk && (
        <ChunkEditorModal
          dim={editingChunk.dim}
          branchName={editingChunk.branchName}
          initialChunk={editingChunk.chunk}
          onClose={() => setEditingChunk(null)}
          onPracticeRhythm={onPracticeRhythm}
        />
      )}

      {/* Create New Branch Modal */}
      {newBranchModal.open && (
        <NewBranchModal
          initialDim={newBranchModal.initialDim}
          initialBranchName={newBranchModal.initialBranch}
          onClose={() => setNewBranchModal({ open: false })}
          onCreated={(dim, branchName, primaryPhrase, openRhythm) => {
            setSelected(prev => ({ ...prev, [dim]: branchName }));
            if (openRhythm && onPracticeRhythm) {
              onPracticeRhythm(primaryPhrase);
            }
          }}
        />
      )}
    </div>
  );
}
