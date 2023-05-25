<template>
  <div class="chart-card">
    <Doughnut id="my-chart-id" :options="chartOptions" :data="chartData" />
  </div>
</template>

<script lang="ts">
import { Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
  DoughnutController,
  CategoryScale,
  LinearScale,
} from "chart.js";
import type { PropType } from "vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PieController,
  DoughnutController,
  CategoryScale,
  LinearScale
);

export default {
  name: "DoughnutChartCard",
  components: { Doughnut },
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
    console.log(this.gamesData);

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
            display: false, // Hide the legend on the top
          },
          tooltip: {
            enabled: true,
          },
        },
      },
    };
  },
};
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
