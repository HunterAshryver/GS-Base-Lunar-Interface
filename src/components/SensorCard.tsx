import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sensor } from '../types';

interface Props {
  sensor: Sensor;
}

export default function SensorCard({ sensor }: Props) {
  const getColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NORMAL': return '#00C851';
      case 'ALERTA': return '#FFB300';
      case 'CRITICO': return '#FF4444';
      default: return '#888';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.tipo}>{sensor.tipo}</Text>
        <View style={[styles.badge, { backgroundColor: getColor(sensor.status) }]}>
          <Text style={styles.badgeText}>{sensor.status}</Text>
        </View>
      </View>
      <Text style={styles.info}>Localização: <Text style={styles.valor}>{sensor.localizacao}</Text></Text>
      <Text style={styles.info}>Valor Atual: <Text style={styles.valor}>{sensor.valorAtual}</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2E2E4E',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tipo: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  info: { color: '#888', fontSize: 13, marginBottom: 4 },
  valor: { color: '#CCCCCC', fontWeight: 'bold' },
});