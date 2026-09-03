import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/theme";

export default function ProfileScreen() {
  const { profile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>My Profile</Text>

      <View style={styles.card}>
        <ProfileRow label="Full Name" value={profile?.fullName} />
        <ProfileRow label="Email" value={profile?.email} />
        <ProfileRow label="Phone" value={profile?.phone} />
      </View>

      {!profile?.fullName && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            Name and phone are only known on this device right after signing up here - the login API
            only returns your email and id. Sign up once on this device to see them here.
          </Text>
        </View>
      )}

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.background },
  rowLabel: { fontSize: 12, color: colors.muted, marginBottom: 2 },
  rowValue: { fontSize: 16, color: colors.text, fontWeight: "600" },
  hintBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  hintText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  logoutButton: {
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: colors.danger, fontWeight: "800", fontSize: 16 },
});
