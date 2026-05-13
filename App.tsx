import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AudioProvider } from "@/contexts/AudioContext";
import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import SurahsPage from "@/pages/SurahsPage";
import ReadPage from "@/pages/ReadPage";
import ListenPage from "@/pages/ListenPage";
import MemorizePage from "@/pages/MemorizePage";
import TestPage from "@/pages/TestPage";
import TasmeeePage from "@/pages/TasmeeePage";
import TafsirPage from "@/pages/TafsirPage";
import SearchPage from "@/pages/SearchPage";
import BookmarksPage from "@/pages/BookmarksPage";
import SettingsPage from "@/pages/SettingsPage";
import ProgressPage from "@/pages/ProgressPage";
import RecitersPage from "@/pages/RecitersPage";
import JuzPage from "@/pages/JuzPage";
import AboutPage from "@/pages/AboutPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 60 } },
});

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/surahs" component={SurahsPage} />
        <Route path="/read/:surahNumber?" component={ReadPage} />
        <Route path="/listen/:surahNumber?" component={ListenPage} />
        <Route path="/memorize/:surahNumber?" component={MemorizePage} />
        <Route path="/test/:surahNumber?" component={TestPage} />
        <Route path="/tasmee/:surahNumber?" component={TasmeeePage} />
        <Route path="/tafsir/:surahNumber?" component={TafsirPage} />
        <Route path="/search" component={SearchPage} />
        <Route path="/bookmarks" component={BookmarksPage} />
        <Route path="/reciters" component={RecitersPage} />
        <Route path="/juz" component={JuzPage} />
        <Route path="/progress" component={ProgressPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/about" component={AboutPage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsProvider>
          <AudioProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </AudioProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
