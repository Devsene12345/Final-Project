import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "elevated" | "outlined" | "flat";
  padding?: number;
}

export default function Card({
  children,
  style,
  variant = "elevated",
  padding = 16,
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.card,
      padding,
    };

    if (variant === "elevated") {
      return {
        ...baseStyle,
        ...styles.elevated,
      };
    } else if (variant === "outlined") {
      return {
        ...baseStyle,
        ...styles.outlined,
      };
    } else {
      return baseStyle;
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  elevated: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  outlined: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
});
