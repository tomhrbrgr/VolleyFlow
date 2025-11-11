import React, { useRef } from 'react';
import { Animated, PanResponder, Text, View } from 'react-native';

type ChipProps = {
  label: string;
  color: string;          // outer ring color
  size: number;
  x: number;              // pixel position
  y: number;
  onRelease: (dx: number, dy: number) => void; // absolute position
  dim?: boolean;          // off-court visual cue
  badge?: string | null;  // e.g., 'S*' for active setter
  highlight?: boolean;    // show validation error outline
};

export const Chip: React.FC<ChipProps> = ({ label, color, size, x, y, onRelease, dim, badge, highlight }) => {
  const pan = useRef(new Animated.ValueXY({ x, y })).current;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan as any).x._value, y: (pan as any).y._value });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const absX = (pan as any).x._value;
        const absY = (pan as any).y._value;
        onRelease(absX, absY);
      },
    })
  ).current;

  React.useEffect(() => {
    Animated.timing(pan, { toValue: { x, y }, duration: 120, useNativeDriver: false }).start();
  }, [x, y]);

  return (
    <Animated.View
      {...responder.panHandlers}
      style={{
        position: 'absolute',
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: dim ? 0.75 : 1,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        borderWidth: highlight ? 3 : 0,
        borderColor: highlight ? '#ef4444' : 'transparent',
      }}
    >
      <View
        style={{
          width: size - 6,
          height: size - 6,
          borderRadius: (size - 6) / 2,
          backgroundColor: '#f3f4f6', // light grey inner
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontWeight: '700', color: '#111827' }}>{label}</Text>
      </View>
      {badge ? (
        <View style={{ position: 'absolute', right: -2, top: -2, backgroundColor: '#ffffff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#111827' }}>{badge}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
};