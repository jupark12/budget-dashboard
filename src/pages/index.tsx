import Head from "next/head";
import { useState } from "react";
import Sidebar from "~/components/Sidebar";
import Dashboard from "~/pages/dashboard";

export default function Home() {
  // State to track the active page
  const [activePage, setActivePage] = useState<Page>('dashboard');

  // Handler for page changes
  const handlePageChange = (page: Page) => {
    setActivePage(page);
  };

  // Render the appropriate content based on activePage
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      // case 'settings':
      //   return <Settings />;
      default:
        return <Dashboard />;
    }
  };
  return (
    <>
      <Head>
        <title>Budget Project</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col">
        <header className="w-full bg-[#4f46e5] shadow-md z-10">
          <div className="mx-auto px-4 py-3">
            <h1 className="text-2xl font-bold text-white text-left">BudgetTracker</h1>
          </div>
        </header>
        <div className="flex flex-1 bg-[#f8fafc] min-h-screen">
          <Sidebar onPageChange={handlePageChange} activePage={activePage} />
          <div className="flex flex-col items-center gap-4 px-16 py-16 border-[1px] w-full bg-white">
            {renderContent()}
          </div>
        </div>
      </main>
    </>
  );
}
