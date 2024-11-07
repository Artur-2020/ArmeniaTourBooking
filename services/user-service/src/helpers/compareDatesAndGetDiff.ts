export default function getTimeMinuteDifference(dbDateString: Date): number {
  const dbDate = new Date(dbDateString);
  const currentDate = new Date();

  const diffInMs = dbDate.getTime() - currentDate.getTime();
  return Math.floor(diffInMs / (1000 * 60));
}
