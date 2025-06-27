import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import * as Progress from "react-native-progress";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function App() {
  const [rates, setRates] = useState<{ usd: number; eur: number } | null>(null);
  const [summary, setSummary] = useState<{
    income: number;
    expenses: number;
    balance: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRates, resSummary] = await Promise.all([
          axios.get("http://192.168.10.57:3000/exchange-rates"),
          axios.get("http://192.168.10.57:3000/summary"),
        ]);
        setRates(resRates.data);
        setSummary(resSummary.data);
      } catch (error) {
        console.error("Error al traer datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !rates || !summary) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF9F1C" />
        <Text style={styles.loaderText}>Cargando datos financieros...</Text>
      </View>
    );
  }

  const progreso = summary.balance / summary.income;

  const exchangeHistory = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Hoy"],
    datasets: [
      {
        data: [0.00023, 0.00026, 0.00028, 0.00024, 0.00023, 0.00025, rates.usd],
        color: () => "#4BC0C0",
        strokeWidth: 2,
      },
      {
        data: [0.00022, 0.00023, 0.00025, 0.00024, 0.00026, 0.00027, rates.eur],
        color: () => "#9966FF",
        strokeWidth: 2,
      },
    ],
    legend: ["USD", "EUR"],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Hola, Andrés Grondona</Text>
      <Text style={styles.subHeader}>
        Hoy es {new Date().toLocaleDateString()}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen financiero</Text>

        <View style={styles.progressContainer}>
          <Progress.Circle
            size={100}
            progress={progreso}
            thickness={10}
            showsText={true}
            color="#FFE066"
            unfilledColor="#FF9F1C"
            borderWidth={0}
            textStyle={{ color: "#FFE066", fontWeight: "bold" }}
            formatText={() => `${Math.round(progreso * 100)}%`}
          />
        </View>

        <Text style={styles.chartLabel}>
          Saldo actual: ${summary.balance.toLocaleString()}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.label}>USD</Text>
          <Text style={styles.value}>{rates.usd}</Text>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.label}>EUR</Text>
          <Text style={styles.value}>{rates.eur}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.label}>Ingresos</Text>
          <Text style={styles.value}>${summary.income.toLocaleString()}</Text>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.label}>Gastos</Text>
          <Text style={styles.value}>${summary.expenses.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Historial de tasa de cambio</Text>
      <View style={styles.graphContainer}>
        <LineChart
          data={exchangeHistory}
          width={SCREEN_WIDTH - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#121212",
            backgroundGradientFrom: "#121212",
            backgroundGradientTo: "#121212",
            decimalPlaces: 5,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: () => "#888",
            propsForDots: {
              r: "3",
              strokeWidth: "1",
              stroke: "#fff",
            },
          }}
          bezier
          style={{ borderRadius: 16 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#121212",
    minHeight: "100%",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loaderText: {
    color: "#FFF",
    marginTop: 12,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFE066",
    marginBottom: 4,
  },
  subHeader: {
    color: "#888",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 10,
  },
  chartLabel: {
    color: "#FFE066",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  smallCard: {
    backgroundColor: "#2a2a2a",
    flex: 1,
    borderRadius: 14,
    padding: 16,
  },
  label: {
    color: "#FF9F1C",
    fontSize: 14,
    marginBottom: 6,
  },
  value: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  graphContainer: {
    marginVertical: 20,
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    padding: 12,
  },
  chartTitle: {
    color: "#FFE066",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
