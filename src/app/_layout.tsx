import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BooksProvider, useBooks } from "../context/BooksContext";
import Onboarding from "../components/Onboarding";
import { useGenreEnrichment } from "../hooks/useGenreEnrichment";

function Gate() {
  useGenreEnrichment();
  const { settings, loading } = useBooks();

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      <Onboarding visible={!loading && !settings.onboarded} />
    </>
  );
}

export default function RootLayout() {
  return (
    <BooksProvider>
      <Gate />
    </BooksProvider>
  );
}
