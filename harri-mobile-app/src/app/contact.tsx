import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { CommercePageHeader } from "@/components/commerce-page-header";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenShell } from "@/components/screen-shell";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { activeTenant } from "@/domain/active-tenant";
import { sendContactMessage } from "@/modules/contact/api";
import { contactChannels } from "@/modules/content/data";
import { useSession } from "@/modules/auth/session-provider";

export default function ContactScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("Serravit");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.name || `${user.firstName} ${user.lastName}`.trim());
    setEmail((current) => current || user.email);
    setPhone((current) => current || user.phone);
  }, [user]);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim() || !company.trim() || message.trim().length < 20) {
      setSuccessMessage(null);
      setError("Tüm alanları doldurun ve mesajı en az 20 karakter yazın.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nextMessage = await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company.trim(),
        message: message.trim(),
      });
      setSuccessMessage(nextMessage);
      setMessage("");
    } catch (nextError) {
      setSuccessMessage(null);
      setError(nextError instanceof Error ? nextError.message : "Mesaj gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenShell>
      <CommercePageHeader
        title="İletişim"
        description="Destek ekibine ulaşmak için bilgilerini bırakabilir veya doğrudan iletişim kanallarını kullanabilirsin."
        backLabel="Desteğe dön"
        onPressBack={() => router.push("/support")}
      />

      <View style={styles.channelsWrap}>
        {contactChannels.map((channel) => (
          <View key={channel.title} style={[styles.channelCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">{channel.title}</ThemedText>
            <ThemedText type="smallBold" style={{ color: activeTenant.palette.primary }}>
              {channel.value}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.formCard, { backgroundColor: activeTenant.palette.surface, borderColor: activeTenant.palette.border }]}>
        <TextField label="Ad Soyad" value={name} onChangeText={setName} placeholder="Adınız soyadınız" testID="contact-name" />
        <TextField label="E-posta" value={email} onChangeText={setEmail} placeholder="örnek@serravit.com" autoCapitalize="none" keyboardType="email-address" testID="contact-email" />
        <TextField label="Telefon" value={phone} onChangeText={setPhone} placeholder="0555 000 00 00" testID="contact-phone" />
        <TextField label="Konu" value={company} onChangeText={setCompany} placeholder="Sipariş desteği" testID="contact-company" />
        <TextField
          label="Mesaj"
          value={message}
          onChangeText={setMessage}
          placeholder="Mesajınız"
          multiline
          numberOfLines={6}
          testID="contact-message"
        />
        {error ? (
          <ThemedText type="small" style={styles.errorText}>
            {error}
          </ThemedText>
        ) : null}
        {successMessage ? (
          <View style={[styles.noticeCard, { backgroundColor: activeTenant.palette.primarySoft, borderColor: activeTenant.palette.border }]}>
            <ThemedText type="smallBold">Mesaj iletildi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {successMessage}
            </ThemedText>
          </View>
        ) : null}
        <PrimaryButton
          label={isSubmitting ? "Gönderiliyor..." : "Mesajı Gönder"}
          onPress={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting}
          testID="contact-submit"
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  title: {
    lineHeight: 40,
  },
  channelsWrap: {
    gap: 12,
  },
  channelCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  errorText: {
    color: "#b42318",
  },
});
