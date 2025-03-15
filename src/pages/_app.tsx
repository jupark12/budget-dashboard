import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import { JobProvider } from "~/context/JobContext";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={GeistSans.className}>
       <JobProvider>
        <Component {...pageProps} />
       </JobProvider>
    </div>
  );
};

export default MyApp;
