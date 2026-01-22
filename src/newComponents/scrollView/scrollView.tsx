import React, { forwardRef } from 'react';
import { ScrollView, RefreshControl, ScrollViewProps } from 'react-native';

interface ScrollViewComponentProps extends ScrollViewProps {
  children: React.ReactNode;
  style?: any;
  refreshing?: boolean; 
  onRefresh?: () => void;
}

const ScrollViewComponent = forwardRef<ScrollView, ScrollViewComponentProps>(
  ({ style, children, refreshing = false, onRefresh, showsVerticalScrollIndicator = false, ...props }, ref) => {
    return (
      <ScrollView
        ref={ref}
        style={[style]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={
          onRefresh && (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )
        }
        {...props}
      >
        {children}
      </ScrollView>
    );
  }
);

export default ScrollViewComponent;
