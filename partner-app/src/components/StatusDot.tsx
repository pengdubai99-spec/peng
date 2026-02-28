import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StatusDotProps {
  status: 'online' | 'offline' | 'streaming';
  size?: number;
}

const colors = {
  online: '#10b981',
  offline: '#64748b',
  streaming: '#6366f1',
};

export default function StatusDot({ status, size = 10 }: StatusDotProps) {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors[status],
        },
        status !== 'offline' && styles.glow,
        status !== 'offline' && { shadowColor: colors[status] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
  glow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
