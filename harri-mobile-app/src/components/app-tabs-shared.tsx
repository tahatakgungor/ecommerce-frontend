import { Feather } from "@expo/vector-icons";
import { Tabs, TabList, TabSlot, TabTrigger, TabListProps, TabTriggerSlotProps } from "expo-router/ui";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomTabInset, commerceShadow } from "@/constants/theme";
import { activeTenant } from "@/domain/active-tenant";
import { useCart } from "@/modules/cart/cart-provider";
import { ThemedText } from "@/components/themed-text";

type NavItem = {
  name: string;
  href: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  badge?: string | null;
};

export default function AppTabs() {
  const { itemCount } = useCart();
  const navItems: NavItem[] = [
    { name: "index", href: "/", label: "Ana", icon: "home" },
    { name: "catalog", href: "/catalog", label: "Katalog", icon: "grid" },
    { name: "roadmap", href: "/roadmap", label: "Fırsat", icon: "tag" },
    { name: "cart", href: "/cart", label: "Sepet", icon: "shopping-bag", badge: itemCount > 0 ? String(itemCount) : null },
    { name: "account", href: "/account", label: "Hesap", icon: "user" },
  ];

  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <FloatingTabList>
          {navItems.map((item) => (
            <TabTrigger key={item.name} name={item.name} href={item.href as never} asChild>
              <TabButton label={item.label} icon={item.icon} badge={item.badge} />
            </TabTrigger>
          ))}
        </FloatingTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  badge?: string | null;
};

function TabButton({ label, icon, badge, isFocused, ...props }: TabButtonProps) {
  const isCart = label === "Sepet";
  return (
    <Pressable {...props} style={({ pressed }) => [styles.buttonTouch, pressed ? styles.pressed : null]}>
      <View
        style={[
          styles.buttonCard,
          {
            backgroundColor: isFocused ? activeTenant.palette.primarySoft : "transparent",
          },
        ]}
      >
        <View style={styles.iconWrap}>
          <Feather
            name={icon}
            size={17}
            color={isFocused ? activeTenant.palette.primary : isCart ? activeTenant.palette.accent : "#66756a"}
          />
          {badge ? (
            <View style={[styles.badge, { backgroundColor: activeTenant.palette.accent }]}>
              <ThemedText type="smallBold" style={styles.badgeText}>
                {badge}
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText
          type="small"
          style={{
            color: isFocused ? activeTenant.palette.text : isCart ? activeTenant.palette.accent : "#66756a",
            fontWeight: isFocused ? "700" : "600",
          }}
        >
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function FloatingTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.listOuter}>
      <View style={[styles.listCard, { backgroundColor: "#fbfdff", borderColor: activeTenant.palette.border }]}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  listOuter: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    paddingBottom: Math.max(8, BottomTabInset - 56),
  },
  listCard: {
    minHeight: 72,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...commerceShadow("#17324a", 14, 30, 0.08, 8),
  },
  buttonTouch: {
    flex: 1,
  },
  buttonCard: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
    overflow: "hidden",
  },
  iconWrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    lineHeight: 12,
  },
  pressed: {
    opacity: 0.78,
  },
});
