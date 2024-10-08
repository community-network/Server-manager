import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import * as React from "react";
import { Line, Pie } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { Button, ButtonRow } from "../components";

import { IServerStat } from "../api/ReturnTypes";
import * as styles from "./Group.module.css";

ChartJS.register(
  zoomPlugin,
  ArcElement,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
);

export function StatsPieChart(props: {
  stats: IServerStat;
}): React.ReactElement {
  const { t } = useTranslation();

  const [chartValues, setChartValues] = React.useState("mapAmount");
  const data = {
    labels: Object.keys(props.stats[chartValues]),
    datasets: [
      {
        label: t("group.status.stats.servers.map.info"),
        data: Object.values(props.stats[chartValues]),
        backgroundColor: [
          "#7fffd4",
          "#458b74",
          "#f0ffff",
          "#838b8b",
          "#ffe4c4",
          "#0000ff",
          "#8a2be2",
          "#a52a2a",
          "#ff4040",
          "#ffd39b",
          "#8b7355",
          "#98f5ff",
          "#53868b",
          "#7fff00",
          "#d2691e",
          "#4a4a4a",
          "#eea2ad",
          "#8b3e2f",
          "#6495ed",
          "#00ffff",
          "#ffb90f",
          "#006400",
          "#caff70",
          "#6e8b3d",
          "#c1ffc1",
          "#698b69",
          "#483d8b",
          "#2f4f4f",
        ],
        borderWidth: 1,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div
      style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
    >
      {/* <h5 style={{ textAlign: "center" }}>{t("group.status.stats.servers.map.main")}</h5> */}
      <ButtonRow style={{ marginLeft: "auto" }}>
        <select
          className={styles.SmallSwitch}
          value={chartValues}
          onChange={(e) => setChartValues(e.target.value)}
        >
          <option value="mapAmount">
            {t("group.status.stats.servers.maps.main")}
          </option>
          <option value="modeAmount">
            {t("group.status.stats.servers.modes.main")}
          </option>
          <option value="worstMap">
            {t("group.status.stats.servers.worstMaps.main")}
          </option>
        </select>
      </ButtonRow>
      <Pie
        options={options}
        style={{ maxHeight: "250px", maxWidth: "250px", marginLeft: "20px" }}
        data={data}
      />
    </div>
  );
}

export function PlayerInfo(props: { stats: IServerStat }): React.ReactElement {
  const { t } = useTranslation();
  const chartRef = React.useRef(null);
  const resetZoom = () => {
    chartRef.current.resetZoom();
  };

  const time = props.stats.timeStamps.map((e: string | number | Date) => {
    const time = new Date(e);
    return time;
  });
  const options: ChartOptions<"line"> = {
    scales: {
      x: {
        type: "time",
        ticks: {
          autoSkip: true,
          autoSkipPadding: 50,
          maxRotation: 0,
        },
        time: {
          displayFormats: {
            hour: "HH:mm, eee d LLL",
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      zoom: {
        limits: {
          x: {
            min: +new Date() - 2629800000,
            max: +new Date(),
            minRange: 10000000,
          },
        },
        zoom: {
          mode: "x",
          drag: { enabled: true },
          pinch: {
            enabled: true,
          },
        },
      },
    },
  };
  const data = {
    labels: time,
    datasets: [
      {
        label: t("group.status.stats.servers.info.players"),
        data: props.stats.playerAmounts,
        fill: false,
        backgroundColor: "#4bc0c0",
        borderColor: "rgba(75,192,192, 0.2)",
      },
      {
        label: t("group.status.stats.servers.info.vips"),
        data: props.stats.vipAmounts,
        fill: false,
        backgroundColor: "#49297e",
        borderColor: "rgba(73, 41, 126, 0.2)",
      },
      {
        label: t("group.status.stats.servers.info.admins"),
        data: props.stats.adminAmounts,
        fill: false,
        backgroundColor: "#195f08",
        borderColor: "rgba(25, 95, 8, 0.2)",
      },
      {
        label: t("group.status.stats.servers.info.bans"),
        data: props.stats.ingameBanAmounts,
        fill: false,
        backgroundColor: "#003fc5",
        borderColor: "rgba(0, 63, 197, 0.2)",
      },
    ],
  };

  return (
    <div style={{ display: "block", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h5 style={{ textAlign: "center" }}>
          {t("group.status.stats.servers.info.main")}
        </h5>
        <Button callback={resetZoom} name="Reset zoom" />
      </div>
      <Line
        ref={chartRef}
        data={data}
        options={options}
        style={{ maxHeight: "250px", marginLeft: "20px" }}
      />
    </div>
  );
}
