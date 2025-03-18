import Head from "next/head";
import { useState } from "react";
import Sidebar from "~/components/Sidebar";
import Dashboard from "~/pages/dashboard";
import Analytics from "~/pages/analytics";

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
      case 'analytics':
        return <Analytics />;
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
        <div className="flex flex-1 bg-gradient-to-b from-[#312E81] to-[#4338CA] min-h-screen">
          <Sidebar onPageChange={handlePageChange} activePage={activePage} />
          <div className="flex flex-col items-center gap-4 px-16 py-8 border-[1px] w-full bg-white">
            {renderContent()}
          </div>
        </div>
      </main>
    </>
  );
}
