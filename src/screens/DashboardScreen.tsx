import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import api from '../services/api';
import SensorCard from '../components/SensorCard';
import { Sensor, Reservatorio, Alerta } from '../types';

export default function DashboardScreen() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [reservatorios, setReservatorios] = useState<Reservatorio[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const [s, r, a] = await Promise.all([
        api.get('/api/sensores'),
        api.get('/api/reservatorios'),
        api.get('/api/alertas'),
      ]);
      setSensores(s.data);
      setReservatorios(r.data);
      setAlertas(a.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.text}>Carregando Base Lunar...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🌕 Lunar Base Interface</Text>
        <Text style={styles.subtitle}>Monitoramento de Recursos</Text>
      </View>

      <Text style={styles.section}>🛰️ Sensores</Text>
      {sensores.slice(0, 5).map(s => <SensorCard key={s.id} sensor={s} />)}

      <Text style={styles.section}>💧 Reservatórios</Text>
      {reservatorios.slice(0, 4).map(r => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.cardTitle}>{r.tipo}</Text>
          <Text>Nível: {r.nivelAtual} / {r.capacidadeMaxima}</Text>
        </View>
      ))}

      <Text style={styles.section}>🚨 Últimos Alertas</Text>
      {alertas.slice(0, 4).map(a => (
        <View key={a.id} style={styles.alertCard}>
          <Text style={styles.alertTitle}>{a.titulo}</Text>
          <Text style={styles.alertDesc}>{a.descricao}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12121E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12121E' },
  text: { color: '#888', marginTop: 10 },
  header: { padding: 24, paddingTop: 50, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  subtitle: { color: '#888', marginTop: 4 },
  section: { color: '#4A90D9', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginTop: 20 },
  card: { backgroundColor: '#1E1E2E', margin: 16, padding: 16, borderRadius: 12 },
  cardTitle: { color: '#FFF', fontWeight: 'bold' },
  alertCard: { backgroundColor: '#2A1E1E', margin: 16, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#FF4444' },
  alertTitle: { color: '#FFAAAA', fontWeight: 'bold' },
  alertDesc: { color: '#CCC', marginTop: 4 },
});