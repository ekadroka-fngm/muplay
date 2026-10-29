import React, { useState, useEffect, useRef } from 'react';
import { Power, RotateCcw, Check } from 'lucide-react';
import { EqualizerBand } from '../types/music';
import { EQ_FREQUENCIES, EQ_BAND_LABELS, EQ_PRESETS } from '../utils/equalizerPresets';

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
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Initialize responsive width dynamically based on viewport
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.min(window.innerWidth - 32, 850);
    }
    return 360;
  });

  // Measure container width immediately and on resize (PRD 10.3)
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const measured = containerRef.current.getBoundingClientRect().width;
        if (measured > 0) {
          setContainerWidth(Math.round(measured));
        }
      }
    };

    updateSize();
    const rafId = requestAnimationFrame(updateSize);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.round(entry.contentRect.width));
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Dimensions for Proportional Responsive SVG Graph (PRD 10.3)
  const isMobile = containerWidth < 540;
  const graphHeight = isMobile ? 210 : 270;
  const paddingX = isMobile ? 22 : 40;
  const paddingTop = isMobile ? 18 : 28;
  const paddingBottom = isMobile ? 32 : 36;
  const usableWidth = Math.max(120, containerWidth - paddingX * 2);
  const usableHeight = graphHeight - paddingTop - paddingBottom;
  const zeroY = paddingTop + usableHeight / 2; // 0 dB line

  // Gain range: -12 dB to +12 dB
  const minGain = -12;
  const maxGain = 12;

  // Convert (frequency index, gain) to (x, y) coordinates
  const getNodeCoordinates = (index: number, gain: number) => {
    const x = paddingX + (index / (bands.length - 1)) * usableWidth;
    const normalizedGain = (gain - minGain) / (maxGain - minGain); // 0 at -12dB, 1 at +12dB
    const y = paddingTop + usableHeight * (1 - normalizedGain);
    return { x, y };
  };

  // Convert client pointer position (screen X, Y) to (bandIndex, snappedGain)
  const getBandAndGainFromPointer = (clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    // Convert client screen coordinates to exact SVG coordinate space
    const scaleX = containerWidth / rect.width;
    const scaleY = graphHeight / rect.height;

    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;

    // Nearest band by horizontal position
    const relX = svgX - paddingX;
    const rawIndex = (relX / usableWidth) * (bands.length - 1);
    const nearestIndex = Math.max(0, Math.min(bands.length - 1, Math.round(rawIndex)));

    // Gain by vertical position
    const clampedY = Math.max(paddingTop, Math.min(paddingTop + usableHeight, svgY));
    const normalized = 1 - (clampedY - paddingTop) / usableHeight;
    const rawGain = minGain + normalized * (maxGain - minGain);
    const snappedGain = Math.round(rawGain * 2) / 2;

    return { index: nearestIndex, gain: snappedGain };
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

  // Pointer interactions on SVG (touch and mouse)
  const handleSvgPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const target = getBandAndGainFromPointer(e.clientX, e.clientY);
    if (target) {
      setSelectedBandIndex(target.index);
      setIsDragging(true);
      onUpdateBandGain(target.index, target.gain);
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const target = getBandAndGainFromPointer(e.clientX, e.clientY);
    if (target && selectedBandIndex !== null) {
      onUpdateBandGain(selectedBandIndex, target.gain);
    }
  };

  const handleSvgPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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

  // Concise label for mobile so labels never overlap
  const formatBandLabel = (label: string) => {
    if (!isMobile) return label;
    return label.replace(' Hz', '').replace(' kHz', 'k');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#09090C] text-[#F0EFEA] p-3 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b-2 border-[#454450] pb-3 sm:pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isEnabled ? 'bg-[#D7FF3F]' : 'bg-[#454450]'}`}></span>
            <h2 className="font-['Archivo_Black'] text-xl sm:text-2xl md:text-3xl tracking-tight text-[#F0EFEA]">
              10-BAND PARAMETRIC EQ
            </h2>
          </div>
          <div className="font-['IBM_Plex_Mono'] text-[10px] sm:text-xs text-[#A3A1AD] mt-1">
            BIQUAD FILTER CHAIN // REAL-TIME WEB AUDIO PROCESSING
          </div>
        </div>

        {/* Action Buttons: Enable Toggle and Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEnabled}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 font-['Space_Grotesk'] text-xs font-bold uppercase border transition-all ${
              isEnabled
                ? 'bg-[#D7FF3F] text-black border-[#D7FF3F] shadow-[2px_2px_0px_0px_#454450]'
                : 'bg-[#13131A] text-[#A3A1AD] border-[#454450] hover:text-[#F0EFEA]'
            }`}
            aria-pressed={isEnabled}
          >
            <Power className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isEnabled ? 'EQ ENABLED' : 'EQ BYPASSED'}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#13131A] text-[#F0EFEA] font-['Space_Grotesk'] text-xs font-bold uppercase border border-[#454450] hover:border-[#FF5A63] hover:text-[#FF5A63] transition-colors"
            title="Reset to Flat curve (0 dB)"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* 10-BAND INTERACTIVE RESPONSIVE GRAPH (PRD 10.1, 10.2, 10.3) */}
      <div
        ref={containerRef}
        className="relative border-2 border-[#454450] bg-[#13131A] overflow-hidden select-none shrink-0 w-full"
        style={{ height: `${graphHeight}px`, minHeight: `${graphHeight}px` }}
      >
        {/* Subtle grid pattern for precision brutalist industrial aesthetic */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#454450_1px,transparent_1px),linear-gradient(to_bottom,#454450_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* SVG Frequency Response Graph with Pure Ease-In/Out Idle Motion & Deterministic Drag */}
        <svg
          ref={svgRef}
          width="100%"
          height={graphHeight}
          viewBox={`0 0 ${containerWidth} ${graphHeight}`}
          onPointerDown={handleSvgPointerDown}
          onPointerMove={handleSvgPointerMove}
          onPointerUp={handleSvgPointerUp}
          onPointerCancel={handleSvgPointerUp}
          className="relative z-10 cursor-crosshair touch-none select-none block w-full h-full"
        >
          <defs>
            {/* Smooth Ease-in-out breathing keyframes for resting frequency control nodes */}
            <style>
              {`
                @keyframes eqNodeBreath {
                  0%, 100% {
                    transform: scale(1);
                    opacity: 0.9;
                  }
                  50% {
                    transform: scale(1.18);
                    opacity: 1;
                  }
                }
                @keyframes eqHaloPulse {
                  0%, 100% {
                    transform: scale(0.92);
                    stroke-opacity: 0.35;
                  }
                  50% {
                    transform: scale(1.16);
                    stroke-opacity: 0.95;
                  }
                }
                .eq-node-idle {
                  transform-origin: center;
                  animation: eqNodeBreath 2.4s ease-in-out infinite;
                  transition: transform 0.2s ease-in-out, fill 0.2s ease-in-out;
                }
                .eq-node-active {
                  transform-origin: center;
                  animation: none !important;
                  transition: transform 0.1s ease-out;
                }
                .eq-halo-idle {
                  transform-origin: center;
                  animation: eqHaloPulse 2s ease-in-out infinite;
                }
                .eq-halo-active {
                  transform-origin: center;
                  animation: none !important;
                }
              `}
            </style>

            <linearGradient id="eqGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D7FF3F" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#D7FF3F" stopOpacity="0.02" />
            </linearGradient>
          </defs>

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
                  opacity={db === 0 ? 0.7 : 0.35}
                />
                <text
                  x={paddingX - 5}
                  y={y + 3.5}
                  textAnchor="end"
                  fill={db === 0 ? '#D7FF3F' : '#A3A1AD'}
                  fontSize={isMobile ? '8.5' : '10'}
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
                y1={paddingTop}
                x2={x}
                y2={paddingTop + usableHeight}
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
              opacity="0.45"
            />
          )}

          {/* Frequency Curve Outline */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={isEnabled ? '#D7FF3F' : '#454450'}
              strokeWidth={isMobile ? '2.5' : '3'}
            />
          )}

          {/* Interactive 10 Band Columns and Frequency Control Points */}
          {bands.map((band, idx) => {
            const { x, y } = getNodeCoordinates(idx, isEnabled ? band.gain : 0);
            const isSelected = selectedBandIndex === idx;
            const columnWidth = usableWidth / (bands.length - 1);
            const nodeSize = isMobile ? 12 : 14;
            const haloSize = isMobile ? 22 : 26;

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
                className="cursor-pointer outline-none"
              >
                {/* Generous touch hit column (PRD 10.3: Easily touchable on mobile) */}
                <rect
                  x={x - columnWidth / 2}
                  y={paddingTop}
                  width={columnWidth}
                  height={usableHeight + 14}
                  fill="transparent"
                />

                {/* Selected Band Focus Halo: Ease-in/out breath when idle, crisp solid lock when dragging */}
                {isSelected && (
                  <rect
                    x={x - haloSize / 2}
                    y={y - haloSize / 2}
                    width={haloSize}
                    height={haloSize}
                    fill="none"
                    stroke="#D7FF3F"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className={isDragging ? 'eq-halo-active' : 'eq-halo-idle'}
                    style={{ transformBox: 'fill-box' }}
                  />
                )}

                {/* Node Shape: brutalist square with ease-in/out motion when resting, direct tracking when clicked */}
                <rect
                  x={x - nodeSize / 2}
                  y={y - nodeSize / 2}
                  width={nodeSize}
                  height={nodeSize}
                  fill={isSelected ? '#D7FF3F' : isEnabled ? '#F0EFEA' : '#454450'}
                  stroke="#09090C"
                  strokeWidth="2"
                  className={isSelected && isDragging ? 'eq-node-active scale-125' : 'eq-node-idle'}
                  style={{ transformBox: 'fill-box' }}
                />

                {/* Center dot on selected node */}
                {isSelected && (
                  <rect
                    x={x - 1.5}
                    y={y - 1.5}
                    width={3}
                    height={3}
                    fill="#09090C"
                  />
                )}

                {/* Floating gain indicator directly above selected node (PRD 10.2) */}
                {isSelected && (
                  <g pointerEvents="none">
                    <rect
                      x={x - 22}
                      y={Math.max(paddingTop - 12, y - (isMobile ? 24 : 26))}
                      width={44}
                      height={16}
                      fill="#09090C"
                      stroke="#D7FF3F"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={Math.max(paddingTop - 12, y - (isMobile ? 24 : 26)) + 11.5}
                      textAnchor="middle"
                      fill="#D7FF3F"
                      fontSize={isMobile ? '8.5' : '9.5'}
                      fontFamily="IBM Plex Mono, monospace"
                      fontWeight="bold"
                    >
                      {band.gain > 0 ? `+${band.gain.toFixed(1)}` : band.gain.toFixed(1)}dB
                    </text>
                  </g>
                )}

                {/* Frequency Text Label at Bottom - Proportional & formatted to never collide */}
                <text
                  x={x}
                  y={graphHeight - (isMobile ? 10 : 12)}
                  textAnchor="middle"
                  fill={isSelected ? '#D7FF3F' : '#A3A1AD'}
                  fontSize={isMobile ? '9' : '10'}
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {formatBandLabel(band.label)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* PRESETS BAR (PRD 10.2: 3-column grid on mobile for perfect screen fitting) */}
      <div className="space-y-2">
        <div className="font-['IBM_Plex_Mono'] text-[11px] sm:text-xs text-[#A3A1AD] uppercase flex items-center justify-between">
          <span>FACTORY PRESETS</span>
          <span>{EQ_PRESETS.length} PROFILES</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2">
          {EQ_PRESETS.map((preset) => {
            const isCurrentPreset = activePreset === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => onApplyPreset(preset.name, preset.gains)}
                className={`flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border font-['Space_Grotesk'] text-[11px] sm:text-xs font-bold transition-all text-left ${
                  isCurrentPreset
                    ? 'bg-[#D7FF3F] text-black border-[#D7FF3F] shadow-[2px_2px_0px_0px_#454450]'
                    : 'bg-[#13131A] text-[#F0EFEA] border-[#454450] hover:border-[#D7FF3F]'
                }`}
              >
                <span className="truncate">{preset.name}</span>
                {isCurrentPreset && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
