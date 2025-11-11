import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRotationStore } from '../store/rotationStore';
import { positionToGrid, gridToPosition, getActiveSetter, isOffCourt, checkOverlap } from '../utils/rotation';
import type { ExtPosition } from '../types';
import { Chip } from './Chip';

const COURT_PADDING = 16;
const GRID_COLS = 3;
const GRID_ROWS = 3; // include off-court row
const CHIP_SIZE = 56;

export const Court: React.FC = () => {
  const { players, rotation, setSlotPosition, rotate, toggleMode } = useRotationStore();
  const courtRef = React.useRef<View>(null);
  const [violations, setViolations] = React.useState<string[]>([]);
  const [validMsg, setValidMsg] = React.useState<string | null>(null);

  // Layout
  const [layout, setLayout] = React.useState({ width: 0, height: 0 });
  const cellW = layout.width > 0 ? (layout.width - COURT_PADDING * 2) / GRID_COLS : 0;
  const cellH = layout.height > 0 ? (layout.height - COURT_PADDING * 2) / GRID_ROWS : 0;

  const zoneCenter = (pos: ExtPosition) => {
    const { row, col } = positionToGrid(pos);
    const x = COURT_PADDING + col * cellW + cellW / 2 - CHIP_SIZE / 2;
    const y = COURT_PADDING + row * cellH + cellH / 2 - CHIP_SIZE / 2;
    return { x, y };
  };

  const handleRelease = (playerId: string, absX: number, absY: number) => {
    const localX = absX + CHIP_SIZE / 2;
    const localY = absY + CHIP_SIZE / 2;
    const xClamped = Math.max(COURT_PADDING, Math.min(localX, layout.width - COURT_PADDING));
    const yClamped = Math.max(COURT_PADDING, Math.min(localY, layout.height - COURT_PADDING));
    const col = Math.min(GRID_COLS - 1, Math.max(0, Math.floor((xClamped - COURT_PADDING) / cellW))) as 0 | 1 | 2;
    const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor((yClamped - COURT_PADDING) / cellH))) as 0 | 1 | 2;
    const pos = gridToPosition(row, col);
    setSlotPosition(playerId, pos);
    setValidMsg(null);
    setViolations([]);
  };

  const runValidation = () => {
    const result = checkOverlap(rotation);
    if (result.ok) {
      setValidMsg('Lineup is legal.');
      setViolations([]);
    } else {
      setValidMsg(`${result.issues.length} issue(s) found.`);
      const ids = new Set<string>();
      result.issues.forEach((iss) => { ids.add(iss.a); ids.add(iss.b); });
      setViolations(Array.from(ids));
    }
  };

  async function exportPNG() {
    const { captureRef } = await import('react-native-view-shot');
    const FS = await import('expo-file-system');
    const Sharing = await import('expo-sharing');
    const uri = await captureRef(courtRef, { format: 'png', quality: 1 });
    const target = FS.cacheDirectory + `rotation_${Date.now()}.png`;
    await FS.copyAsync({ from: uri, to: target });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(target);
  }

  async function exportPDF() {
    const { captureRef } = await import('react-native-view-shot');
    const FS = await import('expo-file-system');
    const { PDFDocument } = await import('pdf-lib');

    const pngUri = await captureRef(courtRef, { format: 'png', quality: 1 });
    const base64Png = await FS.readAsStringAsync(pngUri, { encoding: FS.EncodingType.Base64 });

    const pdf = await PDFDocument.create();
    const png = await pdf.embedPng(base64Png);
    const page = pdf.addPage([png.width, png.height]);
    page.drawImage(png, { x: 0, y: 0, width: png.width, height: png.height });

    const pdfBase64 = await pdf.saveAsBase64({ dataUri: false });
    const pdfPath = FS.cacheDirectory + `rotation_${Date.now()}.pdf`;
    await FS.writeAsStringAsync(pdfPath, pdfBase64, { encoding: FS.EncodingType.Base64 });

    const Sharing = await import('expo-sharing');
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(pdfPath);
  }

  const activeSetterId = getActiveSetter(rotation, players);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ color: '#e5e7eb', fontSize: 22, fontWeight: '800', marginBottom: 6 }}>
        Volleyball Rotations ({rotation.mode})
      </Text>
      <Text style={{ color: '#9ca3af', marginBottom: 10 }}>
        Drag players between zones 1–6 and off‑court O1–O3. Rotate shifts all nine.
      </Text>

      {/* Court */}
      <View
        ref={courtRef as any}
        onLayout={(e) => setLayout(e.nativeEvent.layout)}
        style={{
          flex: 1,
          backgroundColor: '#f3f4f6',
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: '#111827',
        }}
      >
        {/* Grid lines */}
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
          {/* horizontal mid */}
          <View
            style={{
              position: 'absolute',
              left: COURT_PADDING,
              right: COURT_PADDING,
              top: COURT_PADDING + (layout.height - COURT_PADDING * 2) / 2,
              height: 2,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          />
          {/* verticals */}
          <View
            style={{
              position: 'absolute',
              top: COURT_PADDING,
              bottom: COURT_PADDING,
              left: COURT_PADDING + (layout.width - COURT_PADDING * 2) / 3,
              width: 2,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: COURT_PADDING,
              bottom: COURT_PADDING,
              left: COURT_PADDING + ((layout.width - COURT_PADDING * 2) / 3) * 2,
              width: 2,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          />

          {/* zone labels as dark badges */}
          {([4, 3, 2, 5, 6, 1, 7, 8, 9] as ExtPosition[]).map((p) => {
            const { x, y } = zoneCenter(p);
            const txt = p <= 6 ? String(p) : `O${p - 6}`;
            return (
              <View
                key={`zone-${p}`}
                style={{
                  position: 'absolute',
                  left: x + CHIP_SIZE / 2 - 12,
                  top: y + CHIP_SIZE / 2 - 28,
                  backgroundColor: '#111827',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#e5e7eb', fontSize: 10, fontWeight: '700' }}>{txt}</Text>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: 8, alignItems: 'center', zIndex: 1 }}>
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>
            Red = On‑court • Grey = Off‑court • S* = Active Setter
          </Text>
        </View>

        {/* Chips */}
        {rotation.slots.map((s) => {
          const player = players.find((p) => p.id === s.playerId)!;
          const { x, y } = zoneCenter(s.pos);
          const label = player.jersey ? String(player.jersey) : player.name[0];
          const badge = player.id === activeSetterId && player.role === 'S' ? 'S*' : null;
          const color = s.pos <= 6 ? '#ef4444' : '#9ca3af'; // red on-court, light grey off-court
          const dim = isOffCourt(s.pos);
          const highlight = violations.includes(player.id);

          return (
            <View key={player.id}>
              <Chip
                label={label}
                color={color}
                size={CHIP_SIZE}
                x={x}
                y={y}
                onRelease={(absX, absY) => handleRelease(player.id, absX, absY)}
                dim={dim}
                badge={badge}
                highlight={highlight}
              />
              {s.pos <= 6 ? (
                <Text
                  style={{
                    position: 'absolute',
                    left: x + CHIP_SIZE / 2 - 40,
                    top: y + CHIP_SIZE + 2,
                    width: 80,
                    textAlign: 'center',
                    fontSize: 10,
                    color: '#111827',
                    fontWeight: '600',
                  }}
                  numberOfLines={1}
                >
                  {player.name}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Validation banner */}
      {validMsg ? (
        <Text style={{ color: validMsg.includes('issue') ? '#ef4444' : '#22c55e', textAlign: 'center', marginVertical: 6 }}>
          {validMsg}
        </Text>
      ) : null}

      {/* Controls */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        <Pressable onPress={rotate} style={{ flexGrow: 1, backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center', minWidth: 140 }}>
          <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16 }}>Rotate ↻ (All 9)</Text>
        </Pressable>
        <Pressable onPress={toggleMode} style={{ width: 150, backgroundColor: '#111827', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: '#e5e7eb', fontWeight: '800' }}>{rotation.mode === '6-2' ? 'Switch to 5–1' : 'Switch to 6–2'}</Text>
        </Pressable>
        <Pressable onPress={runValidation} style={{ flexGrow: 1, backgroundColor: '#111827', paddingVertical: 14, borderRadius: 12, alignItems: 'center', minWidth: 140 }}>
          <Text style={{ color: '#e5e7eb', fontWeight: '800' }}>Validate Lineup</Text>
        </Pressable>
        <Pressable onPress={exportPNG} style={{ flexGrow: 1, backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center', minWidth: 140 }}>
          <Text style={{ color: '#ffffff', fontWeight: '800' }}>Export PNG</Text>
        </Pressable>
        <Pressable onPress={exportPDF} style={{ flexGrow: 1, backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center', minWidth: 140 }}>
          <Text style={{ color: '#ffffff', fontWeight: '800' }}>Export PDF</Text>
        </Pressable>
      </View>
    </View>
  );
};