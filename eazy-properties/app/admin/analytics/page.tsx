"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  Doughnut,
  Line,
} from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ArcElement,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

import Navigation from "@/components/Navigation";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

type AnalyticsData = {
  totals: {
    users: number;
    properties: number;
    reservations: number;
    reviews: number;
    averageRating: number;
  };
  usersByRole: {
    labels: string[];
    values: number[];
  };
  reservationsByStatus: {
    labels: string[];
    values: number[];
  };
  propertiesByCity: {
    labels: string[];
    values: number[];
  };
  reservationValueByProperty: {
    labels: string[];
    values: number[];
  };
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [message, setMessage] = useState("");

  async function loadAnalytics() {
    const response = await fetch("/api/admin/analytics", {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "Failed to load analytics.");
      return;
    }

    setAnalytics(result.data);
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (!analytics) {
    return (
      <main className="app-shell">
        <Navigation />

        <section className="modern-page">
          <div className="details-box">
            <h2>Loading analytics...</h2>
            {message && <p className="form-message">{message}</p>}
          </div>
        </section>
      </main>
    );
  }

  const usersByRoleData = {
    labels: analytics.usersByRole.labels,
    datasets: [
      {
        label: "Users",
        data: analytics.usersByRole.values,
        backgroundColor: ["#6a00ff", "#8b2cff", "#ff7a00"],
        borderWidth: 0,
      },
    ],
  };

  const reservationsByStatusData = {
    labels: analytics.reservationsByStatus.labels,
    datasets: [
      {
        label: "Reservations",
        data: analytics.reservationsByStatus.values,
        backgroundColor: ["#ff7a00", "#6a00ff", "#e63946", "#776b8f"],
        borderWidth: 0,
      },
    ],
  };

  const propertiesByCityData = {
    labels: analytics.propertiesByCity.labels,
    datasets: [
      {
        label: "Properties by city",
        data: analytics.propertiesByCity.values,
        backgroundColor: "#6a00ff",
        borderRadius: 14,
      },
    ],
  };

  const reservationValueData = {
    labels: analytics.reservationValueByProperty.labels,
    datasets: [
      {
        label: "Estimated reservation value",
        data: analytics.reservationValueByProperty.values,
        borderColor: "#6a00ff",
        backgroundColor: "rgba(106, 0, 255, 0.12)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#210046",
          font: {
            weight: "bold" as const,
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#776b8f",
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "#776b8f",
        },
        grid: {
          color: "rgba(106, 0, 255, 0.08)",
        },
      },
    },
  };

  return (
    <main className="app-shell">
      <Navigation />

      <section className="modern-page">
        <div className="section-heading">
          <p className="eyebrow">Admin area.</p>
          <h1>Analytics dashboard.</h1>
          <p>
            This page uses Chart.js to show application statistics for admins.
          </p>
        </div>

        <div className="analytics-stat-grid">
          <div className="analytics-stat-card">
            <span>Total users</span>
            <strong>{analytics.totals.users}</strong>
          </div>

          <div className="analytics-stat-card">
            <span>Total properties</span>
            <strong>{analytics.totals.properties}</strong>
          </div>

          <div className="analytics-stat-card">
            <span>Total reservations</span>
            <strong>{analytics.totals.reservations}</strong>
          </div>

          <div className="analytics-stat-card">
            <span>Average rating</span>
            <strong>{analytics.totals.averageRating}</strong>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h2>Users by role</h2>
            <div className="chart-box">
              <Doughnut data={usersByRoleData} />
            </div>
          </div>

          <div className="analytics-card">
            <h2>Reservations by status</h2>
            <div className="chart-box">
              <Doughnut data={reservationsByStatusData} />
            </div>
          </div>

          <div className="analytics-card">
            <h2>Properties by city</h2>
            <div className="chart-box">
              <Bar data={propertiesByCityData} options={chartOptions} />
            </div>
          </div>

          <div className="analytics-card">
            <h2>Reservation value by property</h2>
            <div className="chart-box">
              <Line data={reservationValueData} options={chartOptions} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}