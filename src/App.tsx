import { Header } from "@/components/Header";
import { useMetrics } from "@/hooks/useMetrics";

function App() {
  const { isLoading, refreshData } = useMetrics();

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header
          onRefresh={refreshData}
          isLoading={isLoading}
          lastUpdated={new Date()}
        />{" "}
      </div>
    </>
  );
}

export default App;
