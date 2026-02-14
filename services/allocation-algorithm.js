/**
 * Enhanced Seat Allocation System - 8 Algorithms
 * Existing algorithms preserved + 3 new ones added
 */

// ── Helper: sort students ──────────────────────────────────────────────────
function sortStudents(students, mix_branches, mix_years) {
    if (!mix_branches) {
        students.sort((a, b) => {
            if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
            if (a.year !== b.year) return a.year - b.year;
            return a.roll_number.localeCompare(b.roll_number);
        });
    } else if (!mix_years) {
        students.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.roll_number.localeCompare(b.roll_number);
        });
    } else {
        students.sort(() => Math.random() - 0.5);
    }
}

// ── Helper: build one allocation record ───────────────────────────────────
function makeAlloc(exam_id, student, hall_id, row, col, benchPos) {
    const benchCap = benchPos; // bench_position is 1-based
    const seat_number = benchPos > 1
        ? `${String.fromCharCode(64 + row)}${col}-${benchPos}`
        : `${String.fromCharCode(64 + row)}${col}`;
    return {
        exam_id,
        student_id: student.student_id,
        hall_id,
        seat_number,
        row_number: row,
        column_number: col,
        bench_position: benchPos
    };
}

// ── ALGORITHM 1: Sequential (existing default) ────────────────────────────
function allocateStandardGap(data) {
    const { exam_id, students, halls, rules } = data;
    const gap = rules.gap_between_students || 1;
    const benchCapacity = rules.bench_capacity || 1;
    sortStudents(students, rules.mix_branches, rules.mix_years);

    const allocations = [];
    let si = 0;

    for (const hall of halls) {
        if (si >= students.length) break;
        const { hall_id, total_rows, total_columns } = hall;
        for (let row = 1; row <= total_rows; row++) {
            for (let col = 1; col <= total_columns; col++) {
                if (si >= students.length) break;
                if (gap > 0 && (col - 1) % (gap + 1) !== 0) continue;
                for (let b = 1; b <= benchCapacity && si < students.length; b++) {
                    allocations.push(makeAlloc(exam_id, students[si++], hall_id, row, col, b));
                }
            }
        }
    }
    return allocations;
}

// ── ALGORITHM 2: Branch-Segregated ───────────────────────────────────────
function allocateBranchSegregated(data) {
    const { exam_id, students, halls, rules } = data;
    const benchCapacity = rules.bench_capacity || 1;

    const groups = {};
    students.forEach(s => {
        if (!groups[s.branch]) groups[s.branch] = [];
        groups[s.branch].push(s);
    });
    Object.values(groups).forEach(g =>
        g.sort((a, b) => a.year !== b.year ? a.year - b.year : a.roll_number.localeCompare(b.roll_number))
    );

    const allocations = [];
    let hi = 0;

    for (const branch of Object.keys(groups)) {
        const bStudents = groups[branch];
        let si = 0;
        while (si < bStudents.length && hi < halls.length) {
            const { hall_id, total_rows, total_columns } = halls[hi];
            for (let row = 1; row <= total_rows && si < bStudents.length; row++)
                for (let col = 1; col <= total_columns && si < bStudents.length; col++)
                    for (let b = 1; b <= benchCapacity && si < bStudents.length; b++)
                        allocations.push(makeAlloc(exam_id, bStudents[si++], hall_id, row, col, b));
            if (si < bStudents.length) hi++;
        }
    }
    return allocations;
}

// ── ALGORITHM 3: Zigzag (existing) ────────────────────────────────────────
function allocateZigzag(data) {
    const { exam_id, students, halls, rules } = data;
    const benchCapacity = rules.bench_capacity || 1;

    const groups = {};
    students.forEach(s => { if (!groups[s.branch]) groups[s.branch] = []; groups[s.branch].push(s); });
    Object.values(groups).forEach(g => g.sort((a, b) => a.roll_number.localeCompare(b.roll_number)));

    const branches = Object.keys(groups);
    const idx = {};
    branches.forEach(b => idx[b] = 0);
    let bi = 0;
    const allocations = [];

    for (const hall of halls) {
        const { hall_id, total_rows, total_columns } = hall;
        for (let row = 1; row <= total_rows; row++) {
            // Zigzag: even rows left→right, odd rows right→left
            const cols = [];
            for (let c = 1; c <= total_columns; c++) cols.push(c);
            const orderedCols = row % 2 === 0 ? cols.reverse() : cols;

            for (const col of orderedCols) {
                let placed = false, attempts = 0;
                while (!placed && attempts < branches.length) {
                    const branch = branches[bi % branches.length];
                    if (idx[branch] < groups[branch].length) {
                        for (let b = 1; b <= benchCapacity && idx[branch] < groups[branch].length; b++)
                            allocations.push(makeAlloc(exam_id, groups[branch][idx[branch]++], hall_id, row, col, b));
                        placed = true;
                    }
                    bi++;
                    attempts++;
                }
            }
        }
    }
    return allocations;
}

// ── ALGORITHM 4: Year-Segregated (existing) ───────────────────────────────
function allocateYearSegregated(data) {
    const { exam_id, students, halls, rules } = data;
    const benchCapacity = rules.bench_capacity || 1;

    const groups = {};
    students.forEach(s => { if (!groups[s.year]) groups[s.year] = []; groups[s.year].push(s); });
    Object.values(groups).forEach(g => g.sort((a, b) => a.branch.localeCompare(b.branch) || a.roll_number.localeCompare(b.roll_number)));

    const allocations = [];
    let hi = 0;

    for (const year of Object.keys(groups).sort()) {
        const yStudents = groups[year];
        let si = 0;
        while (si < yStudents.length && hi < halls.length) {
            const { hall_id, total_rows, total_columns } = halls[hi];
            for (let row = 1; row <= total_rows && si < yStudents.length; row++)
                for (let col = 1; col <= total_columns && si < yStudents.length; col++)
                    for (let b = 1; b <= benchCapacity && si < yStudents.length; b++)
                        allocations.push(makeAlloc(exam_id, yStudents[si++], hall_id, row, col, b));
            if (si < yStudents.length) hi++;
        }
    }
    return allocations;
}

// ── ALGORITHM 5: Optimized (existing) ─────────────────────────────────────
function allocateOptimized(data) {
    const { exam_id, students, halls, rules } = data;
    const benchCapacity = rules.bench_capacity || 1;
    students.sort((a, b) => a.roll_number.localeCompare(b.roll_number));
    const sortedHalls = [...halls].sort((a, b) => b.capacity - a.capacity);
    const allocations = [];
    let si = 0;

    for (const hall of sortedHalls) {
        if (si >= students.length) break;
        const { hall_id, total_rows, total_columns } = hall;
        for (let row = 1; row <= total_rows; row++)
            for (let col = 1; col <= total_columns; col++)
                for (let b = 1; b <= benchCapacity && si < students.length; b++)
                    allocations.push(makeAlloc(exam_id, students[si++], hall_id, row, col, b));
    }
    return allocations;
}

// ── ALGORITHM 6: Fully Random Allocation ─────────────────────────────────
// Shuffles all students completely randomly before assigning seats
function allocateRandom(data) {
    const { exam_id, students, halls, rules } = data;
    const benchCapacity = rules.bench_capacity || 1;
    // Deep shuffle using Fisher-Yates
    const shuffled = [...students];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const allocations = [];
    let si = 0;
    for (const hall of halls) {
        if (si >= shuffled.length) break;
        const { hall_id, total_rows, total_columns } = hall;
        for (let row = 1; row <= total_rows; row++)
            for (let col = 1; col <= total_columns; col++)
                for (let b = 1; b <= benchCapacity && si < shuffled.length; b++)
                    allocations.push(makeAlloc(exam_id, shuffled[si++], hall_id, row, col, b));
    }
    return allocations;
}

// ── ALGORITHM 7: Left-Right Split ────────────────────────────────────────
// Lower years on left half of each hall, higher years on right half
// If benchCapacity >= 2: seat 1 = lower year, seat 2 = higher year (Auditorium mode)
function allocateLeftRightSplit(data) {
    const { exam_id, students, halls, rules } = data;
    const benchCapacity = rules.bench_capacity || 1;

    // Separate students by year
    const years = [...new Set(students.map(s => s.year))].sort();
    const lowerYear = years[0];
    const upperYear = years[years.length - 1];
    const lower = students.filter(s => s.year === lowerYear).sort((a, b) => a.roll_number.localeCompare(b.roll_number));
    const upper = students.filter(s => s.year === upperYear).sort((a, b) => a.roll_number.localeCompare(b.roll_number));
    const mixed = students.filter(s => s.year !== lowerYear && s.year !== upperYear);

    const allocations = [];

    for (const hall of halls) {
        const { hall_id, total_rows, total_columns } = hall;
        const midCol = Math.ceil(total_columns / 2);

        if (benchCapacity >= 2) {
            // Auditorium mode: bench seat 1 = lower year, seat 2 = upper year
            let li = 0, ui = 0;
            for (let row = 1; row <= total_rows; row++) {
                for (let col = 1; col <= total_columns; col++) {
                    if (li < lower.length)
                        allocations.push(makeAlloc(exam_id, lower[li++], hall_id, row, col, 1));
                    if (ui < upper.length)
                        allocations.push(makeAlloc(exam_id, upper[ui++], hall_id, row, col, 2));
                }
            }
        } else {
            // Left = lower year, Right = upper year
            let li = 0, ui = 0, mi = 0;
            for (let row = 1; row <= total_rows; row++) {
                for (let col = 1; col <= total_columns; col++) {
                    if (col <= midCol && li < lower.length)
                        allocations.push(makeAlloc(exam_id, lower[li++], hall_id, row, col, 1));
                    else if (col > midCol && ui < upper.length)
                        allocations.push(makeAlloc(exam_id, upper[ui++], hall_id, row, col, 1));
                    else if (mi < mixed.length)
                        allocations.push(makeAlloc(exam_id, mixed[mi++], hall_id, row, col, 1));
                }
            }
        }
    }
    return allocations;
}

// ── ALGORITHM 8: Alternate Bench ─────────────────────────────────────────
// Skip every other bench (column) to create physical distance between students
function allocateAlternateBench(data) {
    const { exam_id, students, halls, rules } = data;
    const benchCapacity = rules.bench_capacity || 1;
    sortStudents(students, rules.mix_branches, rules.mix_years);

    const allocations = [];
    let si = 0;

    for (const hall of halls) {
        if (si >= students.length) break;
        const { hall_id, total_rows, total_columns } = hall;
        // First pass: use only odd columns
        for (let row = 1; row <= total_rows && si < students.length; row++)
            for (let col = 1; col <= total_columns && si < students.length; col += 2)
                for (let b = 1; b <= benchCapacity && si < students.length; b++)
                    allocations.push(makeAlloc(exam_id, students[si++], hall_id, row, col, b));
        // Second pass: if students remain, fill even columns
        for (let row = 1; row <= total_rows && si < students.length; row++)
            for (let col = 2; col <= total_columns && si < students.length; col += 2)
                for (let b = 1; b <= benchCapacity && si < students.length; b++)
                    allocations.push(makeAlloc(exam_id, students[si++], hall_id, row, col, b));
    }
    return allocations;
}

// ── Main router ───────────────────────────────────────────────────────────
function allocateSeats(data) {
    const method = (data.rules && data.rules.allocation_method) || 'standard';
    switch (method) {
        case 'standard':          return allocateStandardGap(data);
        case 'branch_segregated': return allocateBranchSegregated(data);
        case 'zigzag':            return allocateZigzag(data);
        case 'year_segregated':   return allocateYearSegregated(data);
        case 'optimized':         return allocateOptimized(data);
        case 'random':            return allocateRandom(data);
        case 'left_right':        return allocateLeftRightSplit(data);
        case 'alternate_bench':   return allocateAlternateBench(data);
        default:                  return allocateStandardGap(data);
    }
}

function generateSeatMap(hallId, examId, allocations) {
    const seatMap = {};
    allocations.filter(a => a.hall_id === hallId).forEach(alloc => {
        const key = `${alloc.row_number}-${alloc.column_number}`;
        if (!seatMap[key]) seatMap[key] = [];
        seatMap[key].push(alloc);
    });
    return seatMap;
}

module.exports = {
    allocateSeats, generateSeatMap,
    allocateStandardGap, allocateBranchSegregated, allocateZigzag,
    allocateYearSegregated, allocateOptimized, allocateRandom,
    allocateLeftRightSplit, allocateAlternateBench
};
