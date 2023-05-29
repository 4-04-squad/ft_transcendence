<template>
  <div class="chart-card">
    <Line id="line-chart-id" :options="chartOptions" :data="chartData" />
  </div>
</template>

<script lang="ts">
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { defineComponent } from "vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
  CategoryScale,
  LinearScale
);

export default defineComponent({
  name: "LineChartCard",
  // eslint-disable-next-line vue/no-reserved-component-names
  components: { Line },
  props: {
    gamesData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    const primaryColor = "#5061f9";
    const successColor = "#11bdb3";

    return {
      chartData: {
        labels: ["Average Win-Loss Ratio", "Player Win-Loss Ratio"],
        datasets: [
          {
            data: [0.7, 0.85], // Replace with actual data
            backgroundColor: [primaryColor, successColor],
            borderWidth: 0,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Win-Loss Ratio",
            font: {
              size: 18,
              weight: "bold",
            },
          },
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.chart-card {
  max-width: 100%;
  max-height: 100%;
  color: var(--text-color);
  border-radius: 10px;
  padding: 20px;
  background-color: var(--border-color);
}

#my-chart-id {
  max-width: 100%;
  max-height: 100%;
}
</style>
