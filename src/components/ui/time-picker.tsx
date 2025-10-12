import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { parse24Hour, format12To24Hour } from '@/utils/timeFormat';

interface TimePickerProps {
  value: string; // 24-hour format "HH:mm"
  onChange: (value: string) => void;
  label?: string;
  isRTL?: boolean;
}

export function TimePicker({ value, onChange, label, isRTL = false }: TimePickerProps) {
  const parsed = parse24Hour(value);
  const [hours, setHours] = useState(parsed.hours);
  const [minutes, setMinutes] = useState(parsed.minutes);
  const [period, setPeriod] = useState<'AM' | 'PM'>(parsed.period);

  // Update when external value changes
  useEffect(() => {
    const parsed = parse24Hour(value);
    setHours(parsed.hours);
    setMinutes(parsed.minutes);
    setPeriod(parsed.period);
  }, [value]);

  const handleChange = (newHours: number, newMinutes: number, newPeriod: 'AM' | 'PM') => {
    const time24 = format12To24Hour(newHours, newMinutes, newPeriod);
    onChange(time24);
  };

  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Select
          value={hours.toString()}
          onValueChange={(val) => {
            const newHours = parseInt(val);
            setHours(newHours);
            handleChange(newHours, minutes, period);
          }}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((h) => (
              <SelectItem key={h} value={h.toString()}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="flex items-center text-2xl font-bold">:</span>

        <Select
          value={minutes.toString()}
          onValueChange={(val) => {
            const newMinutes = parseInt(val);
            setMinutes(newMinutes);
            handleChange(hours, newMinutes, period);
          }}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {m.toString().padStart(2, '0')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          <Button
            type="button"
            variant={period === 'AM' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPeriod('AM');
              handleChange(hours, minutes, 'AM');
            }}
            className="w-14"
          >
            AM
          </Button>
          <Button
            type="button"
            variant={period === 'PM' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setPeriod('PM');
              handleChange(hours, minutes, 'PM');
            }}
            className="w-14"
          >
            PM
          </Button>
        </div>
      </div>
    </div>
  );
}
