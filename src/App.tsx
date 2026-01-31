import { Header } from "@/components/Header";

function App() {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header lastUpdated={new Date()} />
      </div>
    </>
  );
}

export default App;
