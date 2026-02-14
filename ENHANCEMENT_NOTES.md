# Enhancement Notes — What's New

## 8 Allocation Algorithms

| Algorithm | Key | How it works |
|-----------|-----|-------------|
| Sequential | `standard` | Row by row, left to right |
| **Zig-Zag** | `zigzag` | Row 1 L→R, Row 2 R→L, alternating |
| **Alternate Bench** | `alternate_bench` | Skip every other bench; fill gaps if needed |
| Branch Grouping | `branch_segregated` | All CSE together, all ECE together |
| Year Separation | `year_segregated` | Year 1 fills first, Year 2 next |
| **Fully Random** | `random` | Fisher-Yates shuffle, complete randomization |
| **Left-Right Split** | `left_right` | Lower year on left half, higher year on right half |
| Optimized Fill | `optimized` | Largest halls filled first |

### Auditorium Mode
Select **Left-Right Split** + **2 students per bench**:
- Seat 1 = lower year student
- Seat 2 = upper year student
- Enforced row by row across the entire hall

## Bench Configuration Panel
- Students per bench: 1, 2, 3, or 4
- Gap between benches: 0–3

## Visual Seat Map (seatmap.html)
- Proctor/Invigilator bar at top
- Color-coded by year (purple=Y1, green=Y2, amber=Y3, red=Y4)
- Shows bench number, roll number, name, branch+year badge
- Auto-loads from URL params: `?exam_id=1&hall_id=2`
- Print button generates clean print layout (no sidebar)

## Manual Allocation
- Assign specific student to row/column
- Swap two students' seats
- Works after any auto-algorithm run

## Print Layout
Click "Print Layout" on Seat Map page — browser print removes all UI chrome.
Print header shows: Exam name, subject, date/time, hall name.
