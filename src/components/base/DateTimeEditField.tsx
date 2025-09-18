import { DatePickerMD3FromCalendar } from '@components/base/DatePickerMD3';
import TimePickerMD3, { TimeValue } from '@components/base/TimePickerMD3';
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface DateTimeEditFieldProps {
  label?: string;
  value: Date;
  onChange: (newDate: Date) => void;
  mode?: 'date' | 'time' | 'datetime'; // optional mode
  disabled?: boolean;
}

export const DateTimeEditField: React.FC<DateTimeEditFieldProps> = ({
  label,
  value,
  onChange,
  mode = 'datetime',
  disabled = false,
}) => {
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  
    const formattedValue = () => {
    const tzOffset = value.getTimezoneOffset() / -60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const local = new Date(value);

    const day = pad(local.getDate());
    const month = pad(local.getMonth() + 1);
    const hours = pad(local.getHours());
    const minutes = pad(local.getMinutes());
    const timezone = `GMT${tzOffset >= 0 ? '+' : ''}${tzOffset}`;

    if (mode === 'date') return `${day}:${month} (${timezone})`;
    if (mode === 'time') return `${hours}:${minutes} (${timezone})`;
    return `${day}:${month} ${hours}:${minutes} (${timezone})`;
  };


const handleDateConfirm = ( date:Date) => {
  if (!date) {
    return
  }
    if (mode === 'datetime') {
      onChange(date);
      setShowDatePicker(false);
      setShowTimePicker(true);
      
    } else {
      onChange(date); // временно без времени
      setShowDatePicker(false);
      onChange(date);
    }
  };

  const handleTimeConfirm = (time: TimeValue) => {
    const newDate = new Date(value);
    newDate.setHours(time.hour);
    newDate.setMinutes(time.minute);
    newDate.setSeconds(0);

    setShowTimePicker(false);
    onChange(newDate);

  };

  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        label={label}
        value={formattedValue()}
        onPress={() => {
          if (mode === 'time') setShowTimePicker(true);
          else setShowDatePicker(true);
        }}
        onFocus={() => {
          if (mode === 'time') setShowTimePicker(true);
          else setShowDatePicker(true);
        }}
        right={
          <TextInput.Icon
            icon={mode === 'time' ? 'clock' : 'calendar'}
            onPress={() => {
              if (mode === 'time') setShowTimePicker(true);
              else setShowDatePicker(true);
            }}
          />
        }
        editable={true}
        disabled={disabled}
        underlineColor="transparent"
        style={{backgroundColor:"transparent"}}
      />
      

      {/* Date Picker */}
      <DatePickerMD3FromCalendar
        visible={showDatePicker}
        date={value}
        onDismiss={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        label="Select date"
      />


      {/* Time Picker */}
      <TimePickerMD3
        visible={showTimePicker}
        onDismiss={() => setShowTimePicker(false)}
        onConfirm={handleTimeConfirm}
        value={value}
        label="Pick time" 
      />
    </View>
  );
};
