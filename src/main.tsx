import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from "react-router-dom"
import './index.css';
import Router from "./routes";
import { Toaster } from "sonner";
import { ThemeProvider } from './components/theme-provider';
import { AuthBootstrap } from './components/auth/AuthBootstrap';
import { AuthTransitionOverlay } from './components/auth/AuthTransitionOverlay';
import { StudySyncBootstrap } from './components/study/StudySyncBootstrap';
import { WorkspaceSyncBootstrap } from './components/workspace/WorkspaceSyncBootstrap';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="pebble-theme">
        <AuthBootstrap>
          <AuthTransitionOverlay />
          <Toaster position="bottom-right" richColors />
          <StudySyncBootstrap />
          <WorkspaceSyncBootstrap />
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </AuthBootstrap>
      </ThemeProvider>
    </QueryClientProvider>
  // </React.StrictMode>
);
