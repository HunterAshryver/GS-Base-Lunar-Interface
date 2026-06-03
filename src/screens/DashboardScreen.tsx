import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import api from '../services/api';
import { Sensor, Reservatorio, Alerta } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
type ModalConfig = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const randomBetween = (min: number, max: number) =>
  Math.round(Math.random() * (max - min) + min);

const randomStatus = () => {
  const r = Math.random();
  if (r < 0.15) return 'CRITICO';
  if (r < 0.35) return 'ALERTA';
  return 'NORMAL';
};

// ─── SensorRow ────────────────────────────────────────────────────────────────
const SensorRow: React.FC<{ sensor: Sensor }> = ({ sensor }) => {
  const getStatusColor = (status?: string) => {
    if (!status) return '#4A90D9';
    const s = status.toUpperCase();
    if (s === 'CRITICO' || s === 'CRÍTICO') return '#FF4444';
    if (s === 'ALERTA') return '#F97316';
    return '#4ADE80';
  };
  const color = getStatusColor((sensor as any).status);

  return (
    <View style={[sensorStyles.row, { borderLeftColor: color }]}>
      <View style={sensorStyles.left}>
        <Text style={sensorStyles.tipo}>{(sensor as any).tipo ?? 'Sensor'}</Text>
        <Text style={sensorStyles.local}>{(sensor as any).localizacao ?? `ID ${sensor.id}`}</Text>
      </View>
      <View style={sensorStyles.right}>
        {/* ✅ Lê valorAtual primeiro, fallback para ultimaLeitura */}
        <Text style={[sensorStyles.valor, { color }]}>
          {(sensor as any).valorAtual ?? (sensor as any).ultimaLeitura ?? '—'}
        </Text>
        <View style={[sensorStyles.badge, { backgroundColor: color + '22', borderColor: color }]}>
          <Text style={[sensorStyles.badgeText, { color }]}>
            {(sensor as any).status ?? 'ATIVO'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const sensorStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0E1525', marginHorizontal: 16, marginBottom: 8,
    padding: 14, borderRadius: 10, borderLeftWidth: 3, borderWidth: 1, borderColor: '#1A2540',
  },
  left: { flex: 1 },
  tipo: { color: '#E2E8F0', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 },
  local: { color: '#4A6080', fontSize: 12, marginTop: 3 },
  right: { alignItems: 'flex-end', gap: 6 },
  valor: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={{ padding: 40, alignItems: 'center' }}>
    <Text style={{ fontSize: 36, marginBottom: 12 }}>{icon}</Text>
    <Text style={{ color: '#2A3A5A', fontSize: 14, fontWeight: '600' }}>{text}</Text>
  </View>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [reservatorios, setReservatorios] = useState<Reservatorio[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'sensores' | 'reservatorios' | 'alertas'>('sensores');
  const [modal, setModal] = useState<ModalConfig>({ visible: false, title: '', message: '' });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const startSpin = () => {
    spinAnim.setValue(0);
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 900, useNativeDriver: true })
    ).start();
  };
  const stopSpin = () => spinAnim.stopAnimation();
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // ── Carregar dados da API ──────────────────────────────────────────────────
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
    } catch (error: any) {
      setModal({
        visible: true,
        title: '⚠️ Falha de Conexão',
        message: 'Não foi possível conectar à API da Base Lunar.',
        confirmText: 'OK',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);
  const onRefresh = () => { setRefreshing(true); carregarDados(); };

  // ── Simulação de coleta ────────────────────────────────────────────────────
  const confirmarSimulacao = () => {
    setModal({
      visible: true,
      title: '🔬 Simular Coleta',
      message: 'Isso vai gerar leituras aleatórias para todos os sensores, reservatórios e um novo alerta. Continuar?',
      confirmText: 'Simular',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: executarSimulacao,
    });
  };

  const executarSimulacao = async () => {
    setSimulating(true);
    startSpin();
    try {
      const promisesSensores = sensores.map((s) =>
        api.post(`/api/sensores/${s.id}/leitura`, {
          valor: randomBetween(0, 100),
          unidade: (s as any).unidade ?? 'unit',
          status: randomStatus(),
          dataHora: new Date().toISOString(),
        }).catch(() => null)
      );

      const promisesReserv = reservatorios.map((r) =>
        api.patch(`/api/reservatorios/${r.id}`, {
          nivelAtual: randomBetween(
            Math.floor(((r as any).capacidadeMaxima ?? 100) * 0.05),
            (r as any).capacidadeMaxima ?? 100,
          ),
        }).catch(() => null)
      );

      const novoAlerta = api.post('/api/alertas', {
        titulo: '🔬 Coleta Simulada',
        descricao: `Coleta de dados simulada em ${new Date().toLocaleString('pt-BR')}`,
        nivel: randomStatus(),
        dataHora: new Date().toISOString(),
      }).catch(() => null);

      await Promise.all([...promisesSensores, ...promisesReserv, novoAlerta]);
      await carregarDados();

      setModal({
        visible: true,
        title: '✅ Simulação Concluída',
        message: `Dados gerados para ${sensores.length} sensor(es) e ${reservatorios.length} reservatório(s).`,
        confirmText: 'OK',
      });
    } catch (error) {
      setModal({
        visible: true,
        title: '❌ Erro na Simulação',
        message: 'Não foi possível completar a simulação. Verifique a API.',
        confirmText: 'OK',
      });
    } finally {
      setSimulating(false);
      stopSpin();
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalCriticos = sensores.filter(
    (s) => ['CRITICO', 'CRÍTICO'].includes(((s as any).status ?? '').toUpperCase())
  ).length;
  const reservNivel = reservatorios.length
    ? Math.round(
        reservatorios.reduce(
          (acc, r) => acc + ((r as any).nivelAtual ?? 0) / ((r as any).capacidadeMaxima ?? 1),
          0
        ) / reservatorios.length * 100
      )
    : 0;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Text style={{ fontSize: 60 }}>🌕</Text>
        </Animated.View>
        <Text style={styles.loadingTitle}>LUNAR BASE</Text>
        <Text style={styles.loadingSubtitle}>Inicializando sistemas...</Text>
        <ActivityIndicator size="small" color="#4A90D9" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>

      {/* ── Modal ── */}
      <Modal visible={modal.visible} transparent animationType="fade" onRequestClose={() => setModal(p => ({ ...p, visible: false }))}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modal.title}</Text>
            <Text style={styles.modalMessage}>{modal.message}</Text>
            <View style={styles.modalButtons}>
              {modal.showCancel && (
                <TouchableOpacity
                  style={styles.modalBtnCancel}
                  onPress={() => setModal(p => ({ ...p, visible: false }))}
                >
                  <Text style={styles.modalBtnCancelText}>{modal.cancelText ?? 'Cancelar'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={() => {
                  setModal(p => ({ ...p, visible: false }));
                  modal.onConfirm?.();
                }}
              >
                <Text style={styles.modalBtnConfirmText}>{modal.confirmText ?? 'OK'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A90D9" colors={['#4A90D9']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerEyebrow}>FIAP · SISTEMA OPERACIONAL</Text>
              <Text style={styles.headerTitle}>🌕 Lunar Base</Text>
              <Text style={styles.headerSub}>Monitoramento de Recursos</Text>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>ONLINE</Text>
            </View>
          </View>

          {/* Stat cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: '#FF444433' }]}>
              <Text style={[styles.statNum, { color: totalCriticos > 0 ? '#FF4444' : '#4ADE80' }]}>{totalCriticos}</Text>
              <Text style={styles.statLabel}>Críticos</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#4A90D933' }]}>
              <Text style={[styles.statNum, { color: '#4A90D9' }]}>{sensores.length}</Text>
              <Text style={styles.statLabel}>Sensores</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#4ADE8033' }]}>
              <Text style={[styles.statNum, { color: reservNivel < 30 ? '#FF4444' : '#4ADE80' }]}>{reservNivel}%</Text>
              <Text style={styles.statLabel}>Reservas</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#F9731633' }]}>
              <Text style={[styles.statNum, { color: alertas.length > 0 ? '#F97316' : '#4ADE80' }]}>{alertas.length}</Text>
              <Text style={styles.statLabel}>Alertas</Text>
            </View>
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={styles.tabs}>
          {(['sensores', 'reservatorios', 'alertas'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'sensores' ? '🛰️ Sensores' : tab === 'reservatorios' ? '💧 Reservas' : '🚨 Alertas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Sensores ── */}
        {activeTab === 'sensores' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{sensores.length} sensor{sensores.length !== 1 ? 'es' : ''} ativos</Text>
            {sensores.length === 0
              ? <EmptyState icon="🛰️" text="Nenhum sensor registrado" />
              : sensores.map((s) => <SensorRow key={s.id} sensor={s} />)
            }
          </View>
        )}

        {/* ── Reservatórios ── */}
        {activeTab === 'reservatorios' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{reservatorios.length} reservatório(s)</Text>
            {reservatorios.length === 0
              ? <EmptyState icon="💧" text="Nenhum reservatório registrado" />
              : reservatorios.map((r) => {
                  const nivel = (r as any).nivelAtual ?? 0;
                  const cap = (r as any).capacidadeMaxima ?? 1;
                  const pct = Math.min(100, Math.round((nivel / cap) * 100));
                  const barColor = pct < 20 ? '#FF4444' : pct < 50 ? '#F97316' : '#4A90D9';
                  return (
                    <View key={r.id} style={styles.reservCard}>
                      <View style={styles.reservHeader}>
                        <Text style={styles.reservTipo}>{(r as any).tipo ?? 'Reservatório'}</Text>
                        <Text style={[styles.reservPct, { color: barColor }]}>{pct}%</Text>
                      </View>
                      <Text style={styles.reservDetail}>{nivel} / {cap} unidades</Text>
                      <View style={styles.barBg}>
                        <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
                      </View>
                      {(r as any).localizacao && (
                        <Text style={styles.reservLocal}>📍 {(r as any).localizacao}</Text>
                      )}
                    </View>
                  );
                })
            }
          </View>
        )}

        {/* ── Alertas ── */}
        {activeTab === 'alertas' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{alertas.length} alerta(s) registrado(s)</Text>
            {alertas.length === 0
              ? <EmptyState icon="✅" text="Nenhum alerta ativo" />
              : alertas.map((a) => {
                  const nivel = ((a as any).nivel ?? (a as any).severidade ?? '').toUpperCase();
                  const edgeColor = ['CRITICO', 'CRÍTICO'].includes(nivel) ? '#FF4444'
                    : nivel === 'ALTO' ? '#F97316' : '#F59E0B';
                  return (
                    <View key={a.id} style={[styles.alertCard, { borderLeftColor: edgeColor }]}>
                      <View style={styles.alertHeader}>
                        <Text style={styles.alertTitulo}>{(a as any).titulo ?? 'Alerta'}</Text>
                        {nivel ? (
                          <View style={[styles.alertBadge, { backgroundColor: edgeColor + '22', borderColor: edgeColor }]}>
                            <Text style={[styles.alertBadgeText, { color: edgeColor }]}>{nivel}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.alertDesc}>{(a as any).descricao ?? ''}</Text>
                      {(a as any).dataHora && (
                        <Text style={styles.alertTime}>🕐 {new Date((a as any).dataHora).toLocaleString('pt-BR')}</Text>
                      )}
                    </View>
                  );
                })
            }
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB: Simular Coleta ── */}
      <TouchableOpacity
        style={[styles.fab, simulating && styles.fabSimulating]}
        onPress={confirmarSimulacao}
        disabled={simulating}
        activeOpacity={0.85}
      >
        {simulating ? (
          <>
            <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: spin }] }]}>⚙️</Animated.Text>
            <Text style={[styles.fabText, { color: '#F97316' }]}>Simulando...</Text>
          </>
        ) : (
          <>
            <Text style={styles.fabIcon}>🔬</Text>
            <Text style={styles.fabText}>Simular Coleta</Text>
          </>
        )}
      </TouchableOpacity>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#080C18' },
  container: { flex: 1 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080C18' },
  loadingTitle: { color: '#4A90D9', fontSize: 22, fontWeight: '800', marginTop: 16, letterSpacing: 4 },
  loadingSubtitle: { color: '#2A4A6A', fontSize: 13, marginTop: 6, letterSpacing: 1 },

  header: {
    backgroundColor: '#0A1020', paddingHorizontal: 20, paddingTop: 52,
    paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1A2540',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerEyebrow: { color: '#2A4A6A', fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  headerTitle: { color: '#E2E8F0', fontSize: 30, fontWeight: '800', letterSpacing: 0.5 },
  headerSub: { color: '#4A6080', fontSize: 13, marginTop: 4 },
  onlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0A2010',
    borderWidth: 1, borderColor: '#1A4020', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  onlineText: { color: '#4ADE80', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, backgroundColor: '#0E1525', borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  statLabel: { color: '#3A5070', fontSize: 10, fontWeight: '600', marginTop: 3, letterSpacing: 0.5, textTransform: 'uppercase' },

  tabs: {
    flexDirection: 'row', backgroundColor: '#0A1020', paddingHorizontal: 16,
    paddingVertical: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#1A2540',
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center', backgroundColor: '#0E1525', borderWidth: 1, borderColor: '#1A2540' },
  tabActive: { backgroundColor: '#0D2040', borderColor: '#4A90D9' },
  tabText: { color: '#3A5070', fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: '#4A90D9' },

  section: { paddingTop: 16 },
  sectionLabel: { color: '#2A4A6A', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 10 },

  reservCard: {
    backgroundColor: '#0E1525', marginHorizontal: 16, marginBottom: 10,
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1A2540',
  },
  reservHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reservTipo: { color: '#E2E8F0', fontWeight: '700', fontSize: 15 },
  reservPct: { fontSize: 20, fontWeight: '800' },
  reservDetail: { color: '#3A5070', fontSize: 12, marginBottom: 10 },
  barBg: { height: 6, backgroundColor: '#1A2540', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  reservLocal: { color: '#2A4060', fontSize: 11, marginTop: 8 },

  alertCard: {
    backgroundColor: '#100D0D', marginHorizontal: 16, marginBottom: 10,
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#2A1A1A', borderLeftWidth: 4,
  },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  alertTitulo: { color: '#E2C8C8', fontWeight: '700', fontSize: 14, flex: 1, marginRight: 8 },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  alertBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  alertDesc: { color: '#8A7070', fontSize: 13, lineHeight: 19 },
  alertTime: { color: '#4A3030', fontSize: 11, marginTop: 8 },

  fab: {
    position: 'absolute', bottom: 24, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0D2040', paddingHorizontal: 22, paddingVertical: 15,
    borderRadius: 32, borderWidth: 1.5, borderColor: '#4A90D9',
    elevation: 10,
    shadowColor: '#4A90D9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  fabSimulating: { borderColor: '#F97316', shadowColor: '#F97316' },
  fabIcon: { fontSize: 18 },
  fabText: { color: '#4A90D9', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    backgroundColor: '#0E1525', borderWidth: 1, borderColor: '#1A2540',
    borderRadius: 16, padding: 24, width: '84%',
  },
  modalTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  modalMessage: { color: '#4A6080', fontSize: 14, lineHeight: 21, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtnCancel: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: '#1A2540' },
  modalBtnCancelText: { color: '#3A5070', fontWeight: '700' },
  modalBtnConfirm: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 10, backgroundColor: '#0D2040', borderWidth: 1, borderColor: '#4A90D9' },
  modalBtnConfirmText: { color: '#4A90D9', fontWeight: '800', letterSpacing: 0.3 },
});