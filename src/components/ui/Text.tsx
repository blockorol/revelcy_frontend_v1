import * as React from "react";
import { Text as PaperText, useTheme } from "react-native-paper";
import type { AppTheme } from "@theme/types";


type BaseTextProps = React.ComponentProps<typeof PaperText>;
type Variant = NonNullable<BaseTextProps["variant"]>;

type Props = Omit<BaseTextProps, "variant"> & {
  variant: Variant ;
  prominent?: boolean;
};

export function Text({
  variant,
  prominent,
  style,
  children,
  ...rest
}: Props) {
  const override = prominent ? useTheme<AppTheme>().fontsProminent[variant] : undefined;

  return (
    <PaperText variant={variant} style={[override, style]} {...rest}>
      {children}
    </PaperText>
  );
}


export function TextProminent({
  variant,
  style,
  children,
  ...rest
}: Props) {
  const override = useTheme<AppTheme>().fontsProminent[variant];

  return (
    <PaperText variant={variant} style={[override, style]} {...rest}>
      {children}
    </PaperText>
  );
}
