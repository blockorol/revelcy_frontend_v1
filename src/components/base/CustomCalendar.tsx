import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '@theme/types';

interface CustomCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  colors?: {
    background?: string;
    text?: string;
    selectedBackground?: string;
    selectedText?: string;
    headerBackground?: string;
    headerText?: string;
  };
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onDateSelect,
  colors,
}) => {
  const { colors: themeColors } = useTheme() as AppTheme;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const defaultColors = {
    background: colors?.background || themeColors.surfaceContainerLow,
    text: colors?.text || themeColors.onSurface,
    selectedBackground: colors?.selectedBackground || themeColors.primary,
    selectedText: colors?.selectedText || themeColors.onPrimary,
    headerBackground: colors?.headerBackground || themeColors.surfaceContainerLow,
    headerText: colors?.headerText || themeColors.onSurfaceVariant,
  };

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDatePress = (date: Date) => {
    onDateSelect(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={[styles.container, { backgroundColor: defaultColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: defaultColors.headerBackground }]}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={[styles.navText, { color: defaultColors.headerText }]}>‹</Text>
        </TouchableOpacity>
        
        <Text style={[styles.monthText, { color: defaultColors.headerText }]}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={[styles.navText, { color: defaultColors.headerText }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Days of week */}
      <View style={[styles.daysOfWeek, { backgroundColor: defaultColors.background }]}>
        {daysOfWeek.map((day, index) => (
          <Text key={index} style={[styles.dayOfWeek, { color: defaultColors.headerText }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {days.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              date && isSelected(date) && {
                backgroundColor: defaultColors.selectedBackground,
              },
              date && isToday(date) && !isSelected(date) && {
                borderWidth: 2,
                borderColor: defaultColors.selectedBackground,
                backgroundColor: 'transparent',
              },
            ]}
            onPress={() => date && handleDatePress(date)}
            disabled={!date}
          >
            {date && (
              <Text
                style={[
                  styles.dayText,
                  { color: defaultColors.text },
                  date && isSelected(date) && { color: defaultColors.selectedText },
                  isToday(date) && !isSelected(date) && { 
                    color: defaultColors.selectedBackground,
                    fontWeight: 'bold' 
                  },
                ]}
              >
                {date.getDate()}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
  },
  navText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  daysOfWeek: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dayOfWeek: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 16,
    textAlign: 'center',
  },
});