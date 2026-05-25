import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";

import socket from "./socket";

export default function App() {
  const [corrida, setCorrida] = useState(null);

  useEffect(() => {
    // CORREÇÃO: Nome do evento alterado para bater exatamente com o seu backend
    socket.emit("registrar-motorista", {
      nome: "Carlos"
    });

    socket.on("nova-corrida", (novaCorrida) => {
      setCorrida(novaCorrida);
      Alert.alert("Nova corrida recebida");
    });

    // BOA PRÁTICA: Limpa o listener para evitar duplicação de alertas
    return () => {
      socket.off("nova-corrida");
    };
  }, []);

  const aceitarCorrida = () => {
    if (!corrida) return;
    socket.emit("aceitar-corrida", corrida);
    Alert.alert("Corrida aceita");
  };

  const finalizarCorrida = () => {
    if (!corrida) return;
    socket.emit("finalizar-corrida", corrida);
    Alert.alert("Corrida finalizada");
    setCorrida(null); // Limpa o painel do motorista após finalizar
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motorista</Text>

      {corrida ? (
        <View style={styles.card}>
          <Text style={styles.texto}>Origem: {corrida.origem}</Text>
          <Text style={styles.texto}>Destino: {corrida.destino}</Text>

          <TouchableOpacity style={styles.button} onPress={aceitarCorrida}>
            <Text style={styles.buttonText}>Aceitar Corrida</Text>
          </TouchableOpacity>

          {/* CORREÇÃO: O código havia sido cortado a partir daqui */}
          <TouchableOpacity style={styles.button2} onPress={finalizarCorrida}>
            <Text style={styles.buttonText}>Finalizar Corrida</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.aguardando}>Aguardando novas corridas...</Text>
      )}
    </View>
  );
}

// CORREÇÃO: Criação e fechamento correto de todo o StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5"
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333"
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  texto: {
    fontSize: 18,
    marginBottom: 10,
    color: "#444"
  },
  button: {
    backgroundColor: "#28a745", // Verde para aceitar
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15
  },
  button2: {
    backgroundColor: "#dc3545", // Vermelho para finalizar
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  aguardando: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    fontStyle: "italic"
  }
});