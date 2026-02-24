import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import API from "../services/api";

export default function Analytics() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await API.get("/trees/dashboard");

    const data = [
      {
        name: "Healthy",
        population: res.data.healthy,
        color: "green",
        legendFontColor: "#000",
        legendFontSize: 12,
      },
      {
        name: "Critical",
        population: res.data.critical,
        color: "red",
        legendFontColor: "#000",
        legendFontSize: 12,
      },
    ];
  };

  return (
    <View>
      <PieChart
        data={chartData}
        width={Dimensions.get("window").width}
        height={220}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: () => `#000`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
      />
    </View>
  );
}
