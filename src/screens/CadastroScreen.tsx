import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import api from '../services/api';

export default function CadastroScreen() {
  const [tipo, setTipo] = useState<'sensor' | 'reservatorio' | 'alerta'>('sensor');

  // Sensor
  const [tipoSensor, setTipoSensor] = useState('');
  const [localizacaoSensor, setLocalizacaoSensor] = useState('');
  const [valorAtual, setValorAtual] = useState('');

  // Reservatorio
  const [tipoReservatorio, setTipoReservatorio] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [nivelAtual, setNivelAtual] = useState('');
  const [localizacaoRes, setLocalizacaoRes] = useState('');

  // Alerta
  const [tituloAlerta, setTituloAlerta] = useState('');
  const [descricao, setDescricao] = useState('');
  const [severidade, setSeveridade] = useState('ALTA');

  const cadastrar = async () => {
    try {
      if (tipo === 'sensor') {
        if (!tipoSensor || !localizacaoSensor) {
          Alert.alert('Erro', 'Preencha todos os campos do sensor');
          return;
        }
        await api.post('/api/sensores', {
          tipo: tipoSensor,
          localizacao: localizacaoSensor,
          valorAtual: parseFloat(valorAtual) || 0,
          status: 'NORMAL',
        });
        Alert.alert('Sucesso', 'Sensor cadastrado!');
      } 
      else if (tipo === 'reservatorio') {
        if (!tipoReservatorio || !capacidade) {
          Alert.alert('Erro', 'Preencha todos os campos do reservatório');
          return;
        }
        await api.post('/api/reservatorios', {
          tipo: tipoReservatorio,
          capacidadeMaxima: parseFloat(capacidade),
          nivelAtual: parseFloat(nivelAtual) || 0,
          localizacao: localizacaoRes,
        });
        Alert.alert('Sucesso', 'Reservatório cadastrado!');
      } 
      else if (tipo === 'alerta') {
        if (!tituloAlerta || !descricao) {
          Alert.alert('Erro', 'Preencha todos os campos do alerta');
          return;
        }
        await api.post('/api/alertas', {
          titulo: tituloAlerta,
          descricao,
          severidade,
          resolvido: false,
        });
        Alert.alert('Sucesso', 'Alerta cadastrado!');
      }

      // Limpar campos
      setTipoSensor('');
      setLocalizacaoSensor('');
      setValorAtual('');
      setTipoReservatorio('');
      setCapacidade('');
      setNivelAtual('');
      setLocalizacaoRes('');
      setTituloAlerta('');
      setDescricao('');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cadastrar. Verifique se a API está rodando.');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📝 Cadastro</Text>
        <Text style={styles.subtitle}>Adicionar recursos na Base Lunar</Text>
      </View>

      {/* Abas */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tipo === 'sensor' && styles.tabActive]}
          onPress={() => setTipo('sensor')}
        >
          <Text style={styles.tabText}>🛰️ Sensor</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tipo === 'reservatorio' && styles.tabActive]}
          onPress={() => setTipo('reservatorio')}
        >
          <Text style={styles.tabText}>💧 Reservatório</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tipo === 'alerta' && styles.tabActive]}
          onPress={() => setTipo('alerta')}
        >
          <Text style={styles.tabText}>🚨 Alerta</Text>
        </TouchableOpacity>
      </View>

      {/* Formulário Sensor */}
      {tipo === 'sensor' && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Tipo do Sensor" placeholderTextColor="#888" value={tipoSensor} onChangeText={setTipoSensor} />
          <TextInput style={styles.input} placeholder="Localização" placeholderTextColor="#888" value={localizacaoSensor} onChangeText={setLocalizacaoSensor} />
          <TextInput style={styles.input} placeholder="Valor Atual" placeholderTextColor="#888" keyboardType="numeric" value={valorAtual} onChangeText={setValorAtual} />
        </View>
      )}

      {/* Formulário Reservatório */}
      {tipo === 'reservatorio' && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Tipo do Reservatório" placeholderTextColor="#888" value={tipoReservatorio} onChangeText={setTipoReservatorio} />
          <TextInput style={styles.input} placeholder="Capacidade Máxima" placeholderTextColor="#888" keyboardType="numeric" value={capacidade} onChangeText={setCapacidade} />
          <TextInput style={styles.input} placeholder="Nível Atual" placeholderTextColor="#888" keyboardType="numeric" value={nivelAtual} onChangeText={setNivelAtual} />
          <TextInput style={styles.input} placeholder="Localização" placeholderTextColor="#888" value={localizacaoRes} onChangeText={setLocalizacaoRes} />
        </View>
      )}

      {/* Formulário Alerta */}
      {tipo === 'alerta' && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Título do Alerta" placeholderTextColor="#888" value={tituloAlerta} onChangeText={setTituloAlerta} />
          <TextInput style={[styles.input, { height: 80 }]} placeholder="Descrição" placeholderTextColor="#888" multiline value={descricao} onChangeText={setDescricao} />
          <TextInput style={styles.input} placeholder="Severidade (BAIXA/MEDIA/ALTA/CRITICA)" placeholderTextColor="#888" value={severidade} onChangeText={setSeveridade} />
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={cadastrar}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#12121E' },
  header: { padding: 24, paddingTop: 50, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#888', marginTop: 4 },
  tabs: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  tab: { backgroundColor: '#1E1E2E', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#2E2E4E' },
  tabActive: { borderColor: '#4A90D9' },
  tabText: { color: '#FFF', fontWeight: 'bold' },
  form: { paddingHorizontal: 20, gap: 12 },
  input: { backgroundColor: '#1E1E2E', borderRadius: 12, padding: 14, color: '#FFF', borderWidth: 1, borderColor: '#2E2E4E' },
  button: { margin: 20, backgroundColor: '#1E3A5F', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#4A90D9', fontWeight: 'bold', fontSize: 16 },
});