package neo

import "math"

const (
	// LunarDistanceAU is the mean Earth–Moon distance in AU.
	LunarDistanceAU = 0.00256955529

	// Typical NEO geometric albedo bounds used for H → diameter estimates.
	albedoBright  = 0.25 // bright surface → smaller body
	albedoDark    = 0.05 // dark surface → larger body
	albedoTypical = 0.14
)

// EstimateDiameterKm converts absolute magnitude H to diameter for albedo p:
// D = 1329 km / sqrt(p) · 10^(−H/5).
func EstimateDiameterKm(h, albedo float64) float64 {
	return 1329 / math.Sqrt(albedo) * math.Pow(10, -h/5)
}

// HForDiameterKm inverts EstimateDiameterKm.
func HForDiameterKm(dKm, albedo float64) float64 {
	return 5 * math.Log10(1329/(dKm*math.Sqrt(albedo)))
}

// estimateRange returns the plausible diameter range for H, or nil when H is unknown.
func estimateRange(h *float64) *DiameterRange {
	if h == nil {
		return nil
	}
	return &DiameterRange{
		MinM: EstimateDiameterKm(*h, albedoBright) * 1000,
		MaxM: EstimateDiameterKm(*h, albedoDark) * 1000,
	}
}

// kmToM converts an optional km value to meters.
func kmToM(km *float64) *float64 {
	if km == nil {
		return nil
	}
	m := *km * 1000
	return &m
}
