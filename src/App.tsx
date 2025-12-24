import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DateRangeProvider } from "./context/DateRangeContext"; // <--- Importamos el nuevo contexto
import Home from "./pages/Home";
import Copywriter from "./pages/Copywriter";
import Designer from "./pages/Designer";
import AccountManager from "./pages/AccountManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Envolvemos todo con el DateRangeProvider para que el Layout y las Páginas 
          compartan el mismo estado de "rangeDays".
      */}
      <DateRangeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/copywriter" element={<Layout><Copywriter /></Layout>} />
            <Route path="/designer" element={<Layout><Designer /></Layout>} />
            <Route path="/account-manager" element={<Layout><AccountManager /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DateRangeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;