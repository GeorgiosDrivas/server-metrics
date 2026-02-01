import { Header } from "@/components/Header";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/metrics");
        const data = await response.json();
        console.log("Fetched metrics:", data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header lastUpdated={new Date()} />
      </div>
    </>
  );
}

export default App;
