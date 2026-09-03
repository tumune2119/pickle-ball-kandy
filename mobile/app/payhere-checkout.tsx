// Renders PayHere's hosted checkout by loading a tiny local HTML page into a
// WebView that auto-submits a hidden <form method="POST"> - mirroring what
// the web app's BookingForm.tsx does with document.createElement('form').
// PayHere requires a real form POST, not a GET with query params, so a
// WebView with an injected auto-submitting form is the simplest correct
// approach in Expo without needing a hosted intermediary page. See
// mobile/README.md for the rationale.
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView, WebViewNavigation } from "react-native-webview";

import { colors } from "@/lib/theme";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function PayHereCheckoutScreen() {
  const { checkoutUrl, fields } = useLocalSearchParams<{ checkoutUrl: string; fields: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const html = useMemo(() => {
    let parsedFields: Record<string, string> = {};
    try {
      parsedFields = fields ? JSON.parse(fields) : {};
    } catch {
      parsedFields = {};
    }

    const inputs = Object.entries(parsedFields)
      .map(
        ([name, value]) =>
          `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(String(value))}" />`
      )
      .join("\n");

    return `<!DOCTYPE html>
<html>
  <body>
    <form id="payhere-form" method="POST" action="${escapeHtml(checkoutUrl ?? "")}">
      ${inputs}
    </form>
    <script>document.getElementById('payhere-form').submit();</script>
  </body>
</html>`;
  }, [checkoutUrl, fields]);

  const handleNavigationChange = (navState: WebViewNavigation) => {
    // The backend's return_url/cancel_url point at the web app's own pages
    // (my-bookings / book) - once PayHere redirects there, hand control back
    // to the native My Bookings tab instead of leaving the user on the web
    // page inside the WebView.
    if (navState.url.includes("/my-bookings")) {
      router.replace("/(tabs)/my-bookings");
    } else if (navState.url.includes("payment=cancelled")) {
      router.back();
    }
  };

  if (!checkoutUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationChange}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  webview: { flex: 1 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    zIndex: 1,
  },
});
