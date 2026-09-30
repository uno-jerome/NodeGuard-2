import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import "../design/calendar.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getDateKey = (date) =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const parseDate = (value) => {
	if (!value) return null;

	const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
	return Number.isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export default function Calendar({ value = "", onChange, maxDate = "" }) {
	const today = new Date();
	const selectedDate = parseDate(value);
	const latestDate = parseDate(maxDate);
	const [visibleMonth, setVisibleMonth] = useState(
		selectedDate || new Date(today.getFullYear(), today.getMonth(), 1),
	);

	const days = useMemo(() => {
		const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
		const mondayOffset = (firstDay.getDay() + 6) % 7;
		const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
		const previousMonthDays = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 0).getDate();

		return Array.from({ length: 42 }, (_, index) => {
			const dayOffset = index - mondayOffset + 1;
			const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), dayOffset);

			return {
				date,
				currentMonth: dayOffset > 0 && dayOffset <= daysInMonth,
				previousMonth: index < mondayOffset,
				nextMonth: index >= mondayOffset + daysInMonth,
				fallbackDay: index < mondayOffset
					? previousMonthDays - mondayOffset + index + 1
					: index - mondayOffset - daysInMonth + 1,
			};
		});
	}, [visibleMonth]);

	const isSameDay = (firstDate, secondDate) =>
		firstDate &&
		secondDate &&
		getDateKey(firstDate) === getDateKey(secondDate);

	const selectDate = (date) => {
		if (latestDate && date > latestDate) return;

		onChange?.(getDateKey(date), date);
	};

	const moveMonth = (offset) => {
		setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1));
	};

	const showToday = () => {
		setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
		selectDate(today);
	};

	const isFutureDate = (date) => latestDate && date > latestDate;

	return (
		<div className="calendar-picker" aria-label="Calendar date picker">
			<div className="calendar-header">
				<button type="button" className="calendar-arrow" onClick={() => moveMonth(-3)} aria-label="Previous three months">
					<ChevronsLeft size={13} />
				</button>
				<button type="button" className="calendar-arrow calendar-double-arrow" onClick={() => moveMonth(-1)} aria-label="Previous month">
					<ChevronLeft size={13} />
				</button>
				<strong>{visibleMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</strong>
				<button type="button" className="calendar-arrow calendar-double-arrow" onClick={() => moveMonth(1)} aria-label="Next month">
					<ChevronRight size={13} />
				</button>
				<button type="button" className="calendar-arrow" onClick={() => moveMonth(3)} aria-label="Next three months">
					<ChevronsRight size={13} />
				</button>
			</div>

			<div className="calendar-weekdays" aria-hidden="true">
				{WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
			</div>

			<div className="calendar-grid">
				{days.map(({ date, currentMonth, previousMonth, nextMonth, fallbackDay }) => (
					<button
						type="button"
						key={date.toISOString()}
						className={`calendar-day${!currentMonth ? " is-adjacent" : ""}${isSameDay(date, selectedDate) ? " is-selected" : ""}${isSameDay(date, today) ? " is-today" : ""}`}
						onClick={() => selectDate(date)}
						disabled={isFutureDate(date)}
						aria-label={date.toLocaleDateString("en-US", { dateStyle: "long" })}
						aria-pressed={isSameDay(date, selectedDate)}
					>
						{currentMonth ? date.getDate() : fallbackDay}
					</button>
				))}
			</div>

			<button type="button" className="calendar-today-button" onClick={showToday}>Today</button>
		</div>
	);
}
