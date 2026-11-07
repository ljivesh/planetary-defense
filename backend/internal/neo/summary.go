package neo

import "time"

// buildSummary derives dashboard KPIs from already-fetched data.
// approaches must cover the summary window; risk must be sorted by Palermo (desc).
func buildSummary(approaches []CloseApproach, risk []RiskObject, fireballs []Fireball, now time.Time) *Summary {
	s := &Summary{
		WindowDays:    summaryWindowDays,
		ApproachCount: len(approaches),
		SentryCount:   len(risk),
		GeneratedAt:   now.UTC(),
	}

	for i := range approaches {
		a := &approaches[i]
		if a.DistanceAU <= LunarDistanceAU {
			s.WithinLunarDistance++
		}
		if s.ClosestApproach == nil || a.DistanceAU < s.ClosestApproach.DistanceAU {
			s.ClosestApproach = a
		}
		// Largest = brightest absolute magnitude (lowest H).
		if a.H != nil && (s.LargestApproach == nil || *a.H < *s.LargestApproach.H) {
			s.LargestApproach = a
		}
	}

	if len(risk) > 0 {
		s.HighestRisk = &risk[0]
	}
	if len(fireballs) > 0 {
		s.LatestFireball = &fireballs[0]
	}
	return s
}
