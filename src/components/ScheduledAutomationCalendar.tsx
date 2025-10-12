import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Home, Calendar as CalendarIcon } from 'lucide-react';
import { format24To12Hour } from '@/utils/timeFormat';
import type { Villa, AutomationSchedule } from '@/types';
import { addDays, format, startOfDay, isSameDay } from 'date-fns';

interface ScheduledAutomationCalendarProps {
  villas: Villa[];
  schedules: AutomationSchedule[];
  onEditSchedule: (schedule: AutomationSchedule) => void;
  isRTL: boolean;
}

const DAYS_OF_WEEK_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ScheduledAutomationCalendar({ 
  villas, 
  schedules, 
  onEditSchedule,
  isRTL 
}: ScheduledAutomationCalendarProps) {
  // Generate 8 days: yesterday, today, and next 6 days
  const today = startOfDay(new Date());
  const days = [-1, 0, 1, 2, 3, 4, 5, 6].map(offset => addDays(today, offset));

  const getSchedulesForDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    return schedules.filter(schedule => 
      schedule.enabled && schedule.daysOfWeek[dayOfWeek]
    );
  };

  const getDayLabel = (date: Date) => {
    if (isSameDay(date, today)) return 'Today / اليوم';
    if (isSameDay(date, addDays(today, -1))) return 'Yesterday / أمس';
    if (isSameDay(date, addDays(today, 1))) return 'Tomorrow / غداً';
    return format(date, 'EEEE');
  };

  const isPastDay = (date: Date) => date < today;

  return (
    <Card className="card-mobile">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Upcoming Schedules / الجدول القادم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {days.map((day, index) => {
          const daySchedules = getSchedulesForDay(day);
          const dayLabel = getDayLabel(day);
          const isPast = isPastDay(day);
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all ${
                isPast 
                  ? 'bg-muted/20 border-muted opacity-60' 
                  : isSameDay(day, today)
                  ? 'bg-primary/10 border-primary shadow-md'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              {/* Day Header */}
              <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      {format(day, 'MMM dd, yyyy')}
                    </span>
                    {isSameDay(day, today) && (
                      <Badge variant="default" className="text-xs">
                        Today
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {dayLabel} • {DAYS_OF_WEEK_SHORT[day.getDay()]}
                  </span>
                </div>
                
                {daySchedules.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {daySchedules.length} {daySchedules.length === 1 ? 'schedule' : 'schedules'}
                  </Badge>
                )}
              </div>

              {/* Schedules for this day */}
              {daySchedules.length > 0 ? (
                <div className="space-y-2">
                  {daySchedules.map(schedule => {
                    const villa = villas.find(v => v.id === schedule.villaId);
                    return (
                      <div
                        key={schedule.id}
                        className={`p-3 rounded-md bg-card border border-border ${
                          isSameDay(day, today) ? 'shadow-sm' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Home className="h-3.5 w-3.5 text-primary" />
                              <span className="font-medium text-sm">
                                {villa?.name || 'Unknown Villa'}
                              </span>
                              <Badge variant="default" className="text-xs h-5">
                                Active
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className="font-mono">
                                {format24To12Hour(schedule.time)}
                              </span>
                              <span className="text-xs">
                                → {villa?.defaultSmsNumber || '3009'}
                              </span>
                            </div>

                            {schedule.lastRun && isSameDay(new Date(schedule.lastRun), day) && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                ✓ Sent at {new Date(schedule.lastRun).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditSchedule(schedule)}
                            className="h-8 px-2 text-xs"
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-3 text-muted-foreground">
                  <p className="text-sm">No automations scheduled</p>
                  <p className="text-xs">لا توجد أتمتة مجدولة</p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
