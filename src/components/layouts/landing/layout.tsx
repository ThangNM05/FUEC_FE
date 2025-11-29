import { Outlet } from "react-router";

import Footer from "./footer";
import Header from "./header";

function LandingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default LandingLayout;
