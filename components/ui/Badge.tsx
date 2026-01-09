import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  label,
  variant = "default",
  size = "medium",
  style,
  textStyle,
}: BadgeProps) {
  const getBadgeStyle = (): ViewStyle => {
    return {
      ...styles.badge,
      ...styles[`badge_${variant}`],
      ...styles[`badge_${size}`],
    };
  };

  const getTextStyle = (): TextStyle => {
    return {
      ...styles.text,
      ...styles[`text_${variant}`],
      ...styles[`text_${size}`],
    };
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  // Size variants
  badge_small: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badge_medium: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  badge_large: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  // Color variants
  badge_success: {
    backgroundColor: "#e8f5e9",
  },
  badge_warning: {
    backgroundColor: "#fff3e0",
  },
  badge_danger: {
    backgroundColor: "#ffebee",
  },
  badge_info: {
    backgroundColor: "#e3f2fd",
  },
  badge_default: {
    backgroundColor: "#f5f5f5",
  },
  // Text styles
  text: {
    fontWeight: "600",
    textTransform: "capitalize",
  },
  text_small: {
    fontSize: 11,
  },
  text_medium: {
    fontSize: 13,
  },
  text_large: {
    fontSize: 15,
  },
  text_success: {
    color: "#2e7d32",
  },
  text_warning: {
    color: "#f57c00",
  },
  text_danger: {
    color: "#d32f2f",
  },
  text_info: {
    color: "#1976d2",
  },
  text_default: {
    color: "#757575",
  },
});
