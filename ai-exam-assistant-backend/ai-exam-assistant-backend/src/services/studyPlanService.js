const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function buildStudyPlanItems({ examDate, weakTopics }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  const daysUntilExam = Math.max(1, Math.round((exam - today) / MS_PER_DAY));

  const sorted = [...weakTopics].sort((a, b) => a.accuracy_percent - b.accuracy_percent);

  const items = [];
  let dayIndex = 1;

  for (const topic of sorted) {
    if (dayIndex >= daysUntilExam) break;
    const scheduledDate = new Date(today.getTime() + (dayIndex - 1) * MS_PER_DAY);
    const heavy = topic.accuracy_percent < 60;
    items.push({
      dayIndex,
      scheduledDate,
      title: `${topic.topic} — ${heavy ? 'focused practice' : 'light review'}`,
      meta: heavy ? 'High priority' : 'Light review',
      status: dayIndex === 1 ? 'next' : 'upcoming',
    });
    dayIndex += 1;
  }

  const remainingStart = new Date(today.getTime() + (dayIndex - 1) * MS_PER_DAY);
  items.push({
    dayIndex,
    scheduledDate: remainingStart,
    title: 'Mixed review + full mock exam',
    meta: 'Auto-generated from all topics, weighted by latest scores',
    status: 'upcoming',
  });

  return items;
}
