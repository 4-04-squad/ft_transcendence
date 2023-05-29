<template>
  <div class="chart-card">
    <Bar id="bar-chart-id" :options="chartOptions" :data="chartData" />
  </div>
</template>

<script lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { defineComponent, type PropType } from "vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale
);

export default defineComponent({
  name: "BarChartCard",
  components: { Bar },
  props: {
    gamesData: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
    },
    labels: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  data() {
    const primaryColor = "#5061f9";
    const successColor = "#11bdb3";

    return {
      chartData: {
        labels: this.labels,
        datasets: [
          {
            data: this.gamesData,
            backgroundColor: [primaryColor, successColor],
            borderWidth: 0,
          },
        ],
      } as any,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.title,
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
