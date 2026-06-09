const { expo: baseConfig } = require("./app.json");

function readVariant() {
  const rawVariant = String(process.env.APP_VARIANT || process.env.EXPO_PUBLIC_APP_ENV || "production").trim().toLowerCase();
  if (["development", "preview", "production"].includes(rawVariant)) {
    return rawVariant;
  }
  return "production";
}

function resolveVariantMeta(variant) {
  if (variant === "development") {
    return {
      nameSuffix: " Dev",
      identifierSuffix: ".dev",
    };
  }

  if (variant === "preview") {
    return {
      nameSuffix: " Preview",
      identifierSuffix: ".preview",
    };
  }

  return {
    nameSuffix: "",
    identifierSuffix: "",
  };
}

module.exports = () => {
  const variant = readVariant();
  const variantMeta = resolveVariantMeta(variant);
  const baseIdentifier = "com.serravit.mobile";
  const variantIdentifier = `${baseIdentifier}${variantMeta.identifierSuffix}`;

  return {
    ...baseConfig,
    name: `${baseConfig.name}${variantMeta.nameSuffix}`,
    slug: baseConfig.slug,
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0,
    },
    ios: {
      ...baseConfig.ios,
      supportsTablet: false,
      bundleIdentifier: variantIdentifier,
    },
    android: {
      ...baseConfig.android,
      package: variantIdentifier,
    },
    extra: {
      ...(baseConfig.extra || {}),
      appVariant: variant,
    },
  };
};
