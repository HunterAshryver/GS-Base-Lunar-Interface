import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Alerta } from '../types';

export default function AlertasScreen() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarAlertas = async () => {
    try {
      const response = await api.get('/api/alertas');
      setAlertas(response.data);
    } catch (error) {
      console.log('Erro ao carregar alertas', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarAlertas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarAlertas();
  };

  const getSeverityColor = (severidade: string) => {
    switch (severidade?.toUpperCase()) {
      case 'CRITICA': return '#FF4444';
      case 'ALTA': return '#FF8800';
      case 'MEDIA': return '#FFB300';
      default: return '#888';
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4444" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🚨 Alertas Operacionais</Text>
      </View>

      {alertas.length === 0 && (
        <Text style={styles.empty}>Nenhum alerta no momento.</Text>
      )}

      {alertas.map((alerta) => (
        <View key={alerta.id} style={styles.card}>
          <View style={styles.headerCard}>
            <Text style={styles.titulo}>{alerta.titulo}</Text>
            <View style={[styles.badge, { backgroundColor: getSeverityColor(alerta.severidade) }]}>
              <Text style={styles.badgeText}>{alerta.severidade}</Text>
            </View>
          </View>
          <Text style={styles.descricao}>{alerta.descricao}</Text>
          <Text style={styles.status}>
            Status: <Text style={{ color: alerta.resolvido ? '#00C851' : '#FF4444' }}>
              {alerta.resolvido ? 'Resolvido' : 'Pendente'}
            </Text>
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12121E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12121E' },
  header: { padding: 24, paddingTop: 50, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  card: { backgroundColor: '#1E1E2E', margin: 16, padding: 16, borderRadius: 12, borderLeftWidth: 5 },
  headerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titulo: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  descricao: { color: '#CCC', marginVertical: 8 },
  status: { color: '#888', marginTop: 8 },
  empty: { color: '#888', textAlign: 'center', marginTop: 50, fontSize: 16 },
});