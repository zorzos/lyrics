import { useColors } from '@/hooks/use-colors';
import { View, type ViewProps } from 'react-native';


export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView(props: ViewProps) {
  const colors = useColors();

  return (
    <View
      {...props}
      style={[
        { backgroundColor: colors.background },
        props.style
      ]}
    />
  );
}
