import React, { useCallback } from 'react';
import { FlatList, type ListRenderItemInfo } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useTheme } from '@shopify/restyle';

import { Box } from '@ui/components';
import { type Theme } from '@ui/configuration/theme';
import { patterns, type PatternOptions } from '../constants/data';
import Pattern from './pattern/Pattern';

function keyExtractor(item: PatternOptions): string {
  return `pattern-${item.emoji}`;
}

const PatternList: React.FC = () => {
  const theme = useTheme<Theme>();

  const activeIndex = useSharedValue<number>(0);

  const renderItem = useCallback(
    (info: ListRenderItemInfo<PatternOptions>) => {
      return (
        <Pattern
          index={info.index}
          pattern={info.item}
          activeIndex={activeIndex}
        />
      );
    },
    [activeIndex]
  );

  const seperator = useCallback(() => {
    return <Box width={theme.spacing.s} />;
  }, [theme]);

  return (
    <FlatList
      data={patterns}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal={true}
      initialNumToRender={patterns.length}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.m,
      }}
      ItemSeparatorComponent={seperator}
    />
  );
};

export default PatternList;
