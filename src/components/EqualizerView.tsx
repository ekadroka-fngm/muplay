import React, { useState, useEffect, useRef, useId } from 'react';
import { Sliders, RotateCcw, Power, Check } from 'lucide-react';
import { EqualizerBand } from '../types/music';
import { EQ_FREQUENCIES, EQ_BAND_LABELS, EQ_PRESETS } from '../utils/equalizerPresets';
import { audioEngine } from '../audio/audioEngine';

interface EqualizerViewProps {
  bands: EqualizerBand[];
  isEnabled: boolean;
  activePreset: string;
  onUpdateBandGain: (bandIndex: number, gainDb: number) => void;
  onApplyPreset: (presetName: string, gains: number[]) => void;
  onToggleEnabled: () => void;
  onReset: () => void;
  isPlaying: boolean;
}

export const EqualizerView: React.FC<EqualizerViewProps> = ({
  bands,
  isEnabled,
  activePreset,
  onUpdateBandGain,
  onApplyPreset,
  onToggleEnabled,
  onReset,
  isPlaying,
}) => {
  const [selectedBandIndex, setSelectedBandIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Measure container width responsively (PRD 10.3)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Background visualizer animation
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isPlaying) {
        const data = audioEngine.getVisualizerData();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = canvas.width / data.length;
        ctx.fillStyle = 'rgba(215, 255, 63, 0.08)';

        for (let i = 0; i < data.length; i++) {
          const val = data[i] / 255;
          const barHeight = val * canvas.height;
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        }
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Dimensions for SVG Graph
  const graphHeight = 280;
  const paddingX = 40;
  const paddingY = 30;
  const usableWidth = Math.max(200, containerWidth - paddingX * 2);
  const usableHeight = graphHeight - paddingY * 2;
  const zeroY = paddingY + usableHeight / 2; // 0 dB line

  // Gain range: -12 dB to +12 dB
  const minGain = -12;
  const maxGain = 12;

  // Convert (frequency index, gain) to (x, y) coordinates
  const getNodeCoordinates = (index: number, gain: number) => {
    const x = paddingX + (index / (bands.length - 1)) * usableWidth;
    const normalizedGain = (gain - minGain) / (maxGain - minGain); // 0 at -12dB, 1 at +12dB
    const y = paddingY + usableHeight * (1 - normalizedGain);
    return { x, y };
  };

  // Convert y coordinate to gain dB
  const yToGain = (y: number): number => {
    const clampedY = Math.max(paddingY, Math.min(paddingY + usableHeight, y));
    const normalized = 1 - (clampedY - paddingY) / usableHeight;
    const rawGain = minGain + normalized * (maxGain - minGain);
    // Snap to 0.5 dB
    return Math.round(rawGain * 2) / 2;
  };

  // Construct SVG spline path for response curve
  const points = bands.map((b, i) => getNodeCoordinates(i, isEnabled ? b.gain : 0));
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }

  // Handle pointer interactions on SVG graph
  const handlePointerDown = (index: number) => {
    setSelectedBandIndex(index);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || selectedBandIndex === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientY = e.clientY - rect.top;
    const newGain = yToGain(clientY);
    onUpdateBandGain(selectedBandIndex, newGain);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation on nodes (PRD 10.3)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentGain = bands[index].gain;
      const nextGain = Math.min(12, currentGain + 0.5);
      onUpdateBandGain(index, nextGain);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentGain = bands[index].gain;
      const nextGain = Math.max(-12, currentGain - 0.5);
      onUpdateBandGain(index, nextGain);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) setSelectedBandIndex(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < bands.length - 1) setSelectedBandIndex(index + 1);
    }
  };

  const selectedBand = bands[selectedBandIndex] || bands[0];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#09090C] text-[#F0EFEA] p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#454450] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 ${isEnabled ? 'bg-[#D7FF3F]' : 'bg-[#454450]'}`}></span>
            <h2 className="font-['Archivo_Black'] text-2xl md:text-3xl tracking-tight text-[#F0EFEA]">
              10-BAND GRAPHIC EQUALIZER
            </h2>
          </div>
          <div className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] mt-1">
            BIQUAD FILTER CHAIN // REAL-TIME WEB AUDIO PROCESSING
          </div>
        </div>

        {/* Action Buttons: Enable Toggle and Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEnabled}
            className={`flex items-center gap-2 px-3 py-2 font-['Space_Grotesk'] text-xs font-bold uppercase border transition-all ${
              isEnabled
                ? 'bg-[#D7FF3F] text-black border-[#D7FF3F] shadow-[2px_2px_0px_0px_#454450]'
                : 'bg-[#13131A] text-[#A3A1AD] border-[#454450] hover:text-[#F0EFEA]'
            }`}
            aria-pressed={isEnabled}
          >
            <Power className="w-4 h-4" />
            <span>{isEnabled ? 'EQ ENABLED' : 'EQ BYPASSED'}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 bg-[#13131A] text-[#F0EFEA] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#454450] hover:border-[#FF5A63] hover:text-[#FF5A63] transition-colors"
            title="Reset to Flat curve (0 dB)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Selected Band Real-time Telemetry (PRD 10.2: Tampilkan nilai gain per band saat node dipilih) */}
      <div className="p-3 bg-[#13131A] border-2 border-[#454450] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD]">
            ACTIVE BAND #{selectedBandIndex + 1}:
          </div>
          <div className="font-['Archivo_Black'] text-base text-[#D7FF3F]">
            {selectedBand.label}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-['IBM_Plex_Mono'] text-xs">
            <span className="text-[#A3A1AD] mr-2">GAIN:</span>
            <span
              className={`font-bold px-2 py-0.5 border ${
                selectedBand.gain > 0
                  ? 'bg-[#09090C] text-[#D7FF3F] border-[#D7FF3F]'
                  : selectedBand.gain < 0
                  ? 'bg-[#09090C] text-[#FF5A63] border-[#FF5A63]'
                  : 'bg-[#09090C] text-[#F0EFEA] border-[#454450]'
              }`}
            >
              {selectedBand.gain > 0 ? `+${selectedBand.gain.toFixed(1)} dB` : `${selectedBand.gain.toFixed(1)} dB`}
            </span>
          </div>

          <div className="text-[10px] font-['IBM_Plex_Mono'] text-[#A3A1AD] hidden md:block">
            DRAG NODE OR USE KEYBOARD ARROW UP/DOWN (±0.5 dB)
          </div>
        </div>
      </div>

      {/* 10-BAND INTERACTIVE RESPONSIVE GRAPH (PRD 10.1, 10.2, 10.3) */}
      <div
        ref={containerRef}
        className="relative border-2 border-[#454450] bg-[#13131A] overflow-hidden select-none"
        style={{ height: `${graphHeight}px` }}
      >
        {/* Background Visualizer Canvas */}
        <canvas
          ref={canvasRef}
          width={containerWidth}
          height={graphHeight}
          className="absolute inset-0 pointer-events-none opacity-40"
        />

        {/* SVG Frequency Response Graph */}
        <svg
          width="100%"
          height={graphHeight}
          viewBox={`0 0 ${containerWidth} ${graphHeight}`}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative z-10 cursor-crosshair touch-none"
        >
          {/* Horizontal Grid lines (-12dB, -6dB, 0dB, +6dB, +12dB) */}
          {[-12, -6, 0, 6, 12].map((db) => {
            const y = getNodeCoordinates(0, db).y;
            return (
              <g key={db}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={containerWidth - paddingX}
                  y2={y}
                  stroke={db === 0 ? '#D7FF3F' : '#454450'}
                  strokeWidth={db === 0 ? 1.5 : 1}
                  strokeDasharray={db === 0 ? undefined : '4 4'}
                  opacity={db === 0 ? 0.6 : 0.3}
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#A3A1AD"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {db > 0 ? `+${db}` : db}
                </text>
              </g>
            );
          })}

          {/* Vertical Frequency Guidelines */}
          {bands.map((band, idx) => {
            const { x } = getNodeCoordinates(idx, 0);
            return (
              <line
                key={band.frequency}
                x1={x}
                y1={paddingY}
                x2={x}
                y2={graphHeight - paddingY}
                stroke="#454450"
                strokeWidth="1"
                strokeDasharray="2 4"
                opacity="0.3"
              />
            );
          })}

          {/* Frequency Curve Fill Area */}
          {pathD && (
            <path
              d={`${pathD} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`}
              fill={isEnabled ? 'url(#eqGradient)' : 'rgba(69, 68, 80, 0.1)'}
              opacity="0.4"
            />
          )}

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="eqGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D7FF3F" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#D7FF3F" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Frequency Curve Outline */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={isEnabled ? '#D7FF3F' : '#454450'}
              strokeWidth="3"
            />
          )}

          {/* Interactive 10 Band Nodes */}
          {bands.map((band, idx) => {
            const { x, y } = getNodeCoordinates(idx, isEnabled ? band.gain : 0);
            const isSelected = selectedBandIndex === idx;

            return (
              <g
                key={band.frequency}
                tabIndex={0}
                role="slider"
                aria-label={`Equalizer Band ${band.label}`}
                aria-valuenow={band.gain}
                aria-valuemin={-12}
                aria-valuemax={12}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onFocus={() => setSelectedBandIndex(idx)}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  handlePointerDown(idx);
                }}
                className="cursor-pointer outline-none focus:ring-2 focus:ring-[#D7FF3F]"
              >
                {/* Node Outer Halo on Selection */}
                {isSelected && (
                  <rect
                    x={x - 12}
                    y={y - 12}
                    width={24}
                    height={24}
                    fill="none"
                    stroke="#D7FF3F"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Node Shape: brutalist square */}
                <rect
                  x={x - 6}
                  y={y - 6}
                  width={12}
                  height={12}
                  fill={isSelected ? '#D7FF3F' : isEnabled ? '#F0EFEA' : '#454450'}
                  stroke="#09090C"
                  strokeWidth="2"
                  className="transition-transform hover:scale-125"
                />

                {/* Bottom Frequency Text Label */}
                <text
                  x={x}
                  y={graphHeight - 10}
                  textAnchor="middle"
                  fill={isSelected ? '#D7FF3F' : '#A3A1AD'}
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {band.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* PRESETS BAR (PRD 10.2) */}
      <div className="space-y-2">
        <div className="font-['IBM_Plex_Mono'] text-xs text-[#A3A1AD] uppercase flex items-center justify-between">
          <span>FACTORY PRESETS</span>
          <span>{EQ_PRESETS.length} PROFILES</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {EQ_PRESETS.map((preset) => {
            const isCurrentPreset = activePreset === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => onApplyPreset(preset.name, preset.gains)}
                className={`flex items-center justify-between px-3 py-2 border font-['Space_Grotesk'] text-xs font-bold transition-all text-left ${
                  isCurrentPreset
                    ? 'bg-[#D7FF3F] text-black border-[#D7FF3F] shadow-[2px_2px_0px_0px_#454450]'
                    : 'bg-[#13131A] text-[#F0EFEA] border-[#454450] hover:border-[#D7FF3F]'
                }`}
              >
                <span className="truncate">{preset.name}</span>
                {isCurrentPreset && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
