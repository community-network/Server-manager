import React from 'react';
import { Pie, Line, Chart } from 'react-chartjs-2';
import "chartjs-adapter-date-fns";
import zoomPlugin from "chartjs-plugin-zoom";
import { useTranslation } from 'react-i18next';
import { Button } from "../components";

Chart.register(zoomPlugin);

export function MapInfo(props) {
    const { t } = useTranslation();
    const data = {
        labels: Object.keys(props.stats.mapAmount),
        datasets: [
            {
                label: t("group.status.stats.servers.map.info"),
                data: Object.values(props.stats.mapAmount),
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
                borderWidth: 1
            },
        ],
    };
    const options = {
        plugins: {
            legend: {
                display: false
            },
        }
    }

    return (
        <div style={{ display: "block" }}>
            <h5 style={{ textAlign: "center" }}>{t("group.status.stats.servers.map.main")}</h5>
            <Pie
                options={options}
                style={{ maxHeight: "250px", maxWidth: "250px", marginLeft: "20px" }}
                data={data}
            />
        </div>
    )
};


export function PlayerInfo(props) {
    const { t } = useTranslation();
    const chartRef = React.useRef(null)
    const resetZoom = () => {
        chartRef.current.resetZoom()
    }

    const time = props.stats.timeStamps.map((e) => {
        const time = new Date(e);
        return time;
    });
    const options = {
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
                        enabled: true
                    }
                },
            }
        }
    };
    const data = {
        labels: time,
        datasets: [
            {
                label: t("group.status.stats.servers.info.players"),
                data: props.stats.playerAmounts,
                fill: false,
                backgroundColor: "#4bc0c0",
                borderColor: 'rgba(75,192,192, 0.2)'
            },
            {
                label: t("group.status.stats.servers.info.vips"),
                data: props.stats.vipAmounts,
                fill: false,
                backgroundColor: "#49297e",
                borderColor: 'rgba(73, 41, 126, 0.2)'
            },
            {
                label: t("group.status.stats.servers.info.admins"),
                data: props.stats.adminAmounts,
                fill: false,
                backgroundColor: "#195f08",
                borderColor: 'rgba(25, 95, 8, 0.2)'
            },
            {
                label: t("group.status.stats.servers.info.bans"),
                data: props.stats.ingameBanAmounts,
                fill: false,
                backgroundColor: "#003fc5",
                borderColor: 'rgba(0, 63, 197, 0.2)'
            },
        ],
    };

    return (
        <div style={{ display: "block", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h5 style={{ textAlign: "center" }}>{t("group.status.stats.servers.info.main")}</h5>
                <Button callback={resetZoom} name="Reset zoom" />
            </div>
            <Line
                ref={chartRef}
                data={data}
                options={options}
                style={{ maxHeight: "250px", marginLeft: "20px" }}
            />
        </div>
    )
}