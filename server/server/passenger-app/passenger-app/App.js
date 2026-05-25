import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";

import socket from "./socket";

export default function App() {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");

  useEffect(() => {
    // Ouvindo os eventos do servidor
    socket.on("corrida-aceita", () => {
      Alert.alert("Sucesso", "Motorista aceitou sua corrida!");
    });

    socket.on("corrida-finalizada", () => {
      Alert.alert("Finalizada", "Corrida finalizada com sucesso.");
    });

    socket.on("sem-motorista", () => {
      Alert.alert("Ops!", "Nenhum motorista disponível no momento.");
    });

    // CORREÇÃO IMPORTANTÍSSIMA: Limpa os listeners ao desmontar o componente
    // Isso evita que a mesma mensagem dispare múltiplos alertas na tela
    return () => {
      socket.off("corrida-aceita");
      socket.off("corrida-finalizada");
      socket.off("sem-motorista");
    };
  }, []);

  const solicitarCorrida = () => {
    // Validação simples para não enviar campos vazios
    if (!origem.trim() || !destino.trim()) {
      Alert.alert("Aviso", "Por favor, preencha a origem e o destino.");
      return;
    }

    socket.emit("solicitar-corrida", {
      passageiro: "Passageiro Teste",
      origem,
      destino
    });

    Alert.alert("Solicitado", "Procurando por motoristas...");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passageiro</Text>

      <TextInput
        placeholder="Origem"
        placeholderTextColor="#888"
        style={styles.input}
        value={origem}
        onChangeText={setOrigem}
      />

      <TextInput
        placeholder="Destino"
        placeholderTextColor="#888"
        style={styles.input}
        value={destino}
        onChangeText={setDestino}
      />

      <TouchableOpacity style={styles.button} onPress={solicitarCorrida}>
        <Text style={styles.buttonText}>Solicitar Corrida</Text>
      </TouchableOpacity>
    </View>
  );
}

// CORREÇÃO: Fechamento correto das chaves e criação dos estilos que faltavam
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#000"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#000"
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  }
});